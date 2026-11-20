import { RecordManagementError } from "@/lib/record-management-model"
import { withBusinessWrite, assertRecordsAlive, releaseBusinessGuard, isBusinessWriteActive } from "@/lib/business-write-guard"
import "server-only"
import type { sheets_v4 } from "googleapis"
import { env } from "@/lib/env"
import { sportsSheetsClient, invalidateSportsSheets } from "@/lib/google-sheets"
import { withBoundedRetry } from "@/lib/google-sheets-resilience"
import { SportsError, canonicalDate, hash, type SportsBook, type SportsOperation, type SportsPlan, type SportsReceipt, type SportsRow, type SportsSnapshot, type TransferContext, type LicenceClaimReplacement } from "@/lib/sports-model"

type Metadata = { metadataId: number; metadataKey: string; metadataValue: string }
type Table = { sheetId: number; headers: string[]; rows: Array<{ index: number; row: SportsRow }> }
export type SportsLease = { owner: string; items: Array<{ id: number; key: string }> }
export interface SportsStore {
  acquire(actorIds: string[], operation: SportsOperation, resumeOwn?: boolean): Promise<SportsLease>
  release(lease: SportsLease): Promise<void>
  load(onboarding?: boolean | "licence" | "affiliation" | "attachment"): Promise<SportsSnapshot>
  receipt(book: SportsBook, operation: SportsOperation): Promise<SportsReceipt | null>
  validatePlans(plans: SportsPlan[]): void
  completed(book: SportsBook, operation: SportsOperation): Promise<SportsRow[] | null>
  recoverCompleted(actorIds: string[], operation: SportsOperation): Promise<void>
  contextFor(id: string): Promise<TransferContext | undefined>
  commit(operation: SportsOperation, plan: SportsPlan): Promise<SportsRow[]>
}
const namespace = "fevoco:sports:v1:"
const options = { timeout: 20_000, retry: false } as const
const candidateIds = (key: string) => Array.from({ length: 8 }, (_, slot) => (parseInt(hash(`${namespace}${key}:${slot}`).slice(0, 8), 16) % 2147483646) + 1)
const receiptKey = (op: SportsOperation) => `receipt:${op.id}`
// Compatibility fields for existing consumers; business rules and authorization still apply.
export const sportsWritesEnabled = () => true
export const sportsWriteBlockReason = ""

export function createGoogleSportsStore(): SportsStore {
  const config = env.googleSheets
  const bookIds = { affiliations: config.affiliationsSpreadsheetId, licences: config.licencesSpreadsheetId, actors: config.acteursSpreadsheetId }
  const tables = new Map<string, Record<string, Table>>()
  const reservedRecords = new Map<string, Record<string, string[]>>()
  const deletedRecords: Record<string, string[]> = {}
  const metadataKeys = new Map<string, string[]>()
  const metadataValues = new Map<string, Array<{metadataId?: number | null; metadataKey?: string | null; metadataValue?: string | null}>>()
  let ownedOperationId = ""
  const deletedLicences: Record<string, string>[] = []
  const bookId = (book: SportsBook) => bookIds[book]
  async function search(book: SportsBook, keys: string[], includeIds = false): Promise<Metadata[]> {
    const client = await sportsSheetsClient()
    const filters: sheets_v4.Schema$DataFilter[] = keys.map(key => ({ developerMetadataLookup: { metadataKey: namespace + key, visibility: "DOCUMENT" } }))
    if (includeIds) filters.push(...[...new Set(keys.flatMap(candidateIds))].map(metadataId => ({ developerMetadataLookup: { metadataId } })))
    if (!filters.length) return []
    const response = await withBoundedRetry(() => client.spreadsheets.developerMetadata.search({ spreadsheetId: bookId(book), requestBody: { dataFilters: filters } }, options))
    return [...new Map((response.data.matchedDeveloperMetadata || []).flatMap(item => {
      const m = item.developerMetadata
      return m?.metadataId && m.metadataKey ? [[m.metadataId, { metadataId: m.metadataId, metadataKey: m.metadataKey, metadataValue: m.metadataValue || "" }] as const] : []
    })).values()]
  }
  function chooseClaims(keys: string[], values: string[], existing: Metadata[], reservedIds: number[] = []) {
    const used = new Set([...existing.map(item => item.metadataId), ...reservedIds])
    return keys.map((key, index) => {
      if (existing.some(item => item.metadataKey === namespace + key)) throw new SportsError("RESERVATION_EXISTANTE", "Une réservation persistante existe déjà. Actualisez ou reprenez la même tentative.")
      const id = candidateIds(key).find(candidate => !used.has(candidate))
      if (!id) throw new SportsError("COLLISION_RESERVATION", "Les identifiants de réservation doivent être vérifiés.", 503)
      used.add(id)
      return { metadataId: id, metadataKey: namespace + key, metadataValue: values[index] }
    })
  }
  const metadataRequests = (items: Metadata[]): sheets_v4.Schema$Request[] => items.map(item => ({ createDeveloperMetadata: { developerMetadata: { ...item, visibility: "DOCUMENT", location: { spreadsheet: true } } } }))
  async function readTables(spreadsheetId: string, names: string[], readOnly = false) {
    if (!spreadsheetId || !config.clientEmail || !config.privateKey) throw new SportsError("SOURCE_NON_CONFIGUREE", "Un classeur sportif n’est pas configuré.", 503)
    const client = await sportsSheetsClient()
    const readReservations = !readOnly && names.some(name => ["ATHLETE_AFFILIATIONS", "ATHLETE_LICENCES", "ATHLETES"].includes(name))
    const fields = "sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))" + (readReservations ? ",developerMetadata(metadataId,metadataKey,metadataValue)" : "")
    const meta = readOnly ? { data: { sheets: names.map(title => ({ properties: { title, sheetId: 0, gridProperties: { rowCount: 1, columnCount: 52 } } })), developerMetadata: [] } } : await withBoundedRetry(() => client.spreadsheets.get({ spreadsheetId, fields }, options))
    if (readReservations) {
      metadataKeys.set(spreadsheetId, (meta.data.developerMetadata || []).map(item => item.metadataKey || ""))
      metadataValues.set(spreadsheetId, meta.data.developerMetadata || [])
      const reservations: Record<string, string[]> = {}
      for (const item of meta.data.developerMetadata || []) {
        const match = item.metadataKey?.match(/^fevoco:sports:v1:record:(ATHLETE_AFFILIATIONS|ATHLETE_LICENCES|ATHLETES):(.+)$/)
        if (match) (reservations[match[1]] ??= []).push(match[2])
        const deleted = item.metadataKey?.match(/^fevoco:sports:v1:deleted:([^:]+):(.+)$/)
        if (deleted) {
          (deletedRecords[deleted[1]] ??= []).push(deleted[2])
          ;(reservations[deleted[1]] ??= []).push(deleted[2])
          if (deleted[1] === "ATHLETE_LICENCES") {
            try { const reservation = JSON.parse(item.metadataValue || ""); if (reservation.numero_licence) deletedLicences.push(reservation) } catch { throw new SportsError("JOURNAL_INVALIDE", "Réservation de licence supprimée invalide.", 503) }
          }
        }
      }
      reservedRecords.set(spreadsheetId, reservations)
    }
    const properties = new Map((meta.data.sheets || []).map(sheet => [sheet.properties?.title, sheet.properties]))
    for (const name of names) if (!properties.get(name)) throw new SportsError("SCHEMA_INCOMPLET", `Onglet ${name} absent.`, 503)
    const column = (n: number): string => n <= 26 ? String.fromCharCode(64 + n) : column(Math.floor((n - 1) / 26)) + column((n - 1) % 26 + 1)
    const ranges = readOnly ? names.map(name => `'${name}'!A:AZ`) : names.map(name => `'${name}'!A1:${column(Math.min(properties.get(name)?.gridProperties?.columnCount || 1, 52))}${properties.get(name)?.gridProperties?.rowCount || 1}`)
    const values = await withBoundedRetry(() => client.spreadsheets.values.batchGet({ spreadsheetId, ranges, valueRenderOption: "FORMATTED_VALUE" }, options))
    const result: Record<string, Table> = {}
    names.forEach((name, index) => {
      const grid = values.data.valueRanges?.[index]?.values || [], headers = (grid[0] || []).map(value => String(value).trim().toLowerCase())
      const nonempty = headers.filter(Boolean)
      if (!nonempty.length || new Set(nonempty).size !== nonempty.length) throw new SportsError("SCHEMA_INVALIDE", `En-têtes ${name} absents ou dupliqués.`, 503)
      result[name] = { sheetId: properties.get(name)!.sheetId!, headers, rows: grid.slice(1).flatMap((values, rowIndex) => {
        if (!values.some(value => String(value ?? "").trim())) return []
        return [{ index: rowIndex + 1, row: Object.fromEntries(headers.filter(Boolean).map(header => [header, String(values[headers.indexOf(header)] ?? "").trim()])) }]
      }) }
    })
    tables.set(spreadsheetId, result)
    return result
  }
  async function receipt(book: SportsBook, operation: SportsOperation) {
    const matches = (await search(book, [receiptKey(operation)])).filter(m => m.metadataKey === namespace + receiptKey(operation))
    if (matches.length > 1) throw new SportsError("JOURNAL_INCOHERENT", "Le journal sportif contient un doublon.", 503)
    if (!matches.length) return null
    const stored = JSON.parse(matches[0].metadataValue) as SportsReceipt
    if (stored.fingerprint !== operation.fingerprint) throw new SportsError("IDEMPOTENCE_CONFLIT", "Cette tentative a déjà été utilisée avec d’autres données.")
    if (!isBusinessWriteActive()) await releaseBusinessGuard(`${operation.id}:${book}`)
    return stored
  }
  async function completed(book: SportsBook, operation: SportsOperation) {
    const stored = await receipt(book, operation)
    if (!stored) return null
    const data = await readTables(bookId(book), [stored.table])
    const key = stored.table === "ATHLETES" ? "id_athlete" : stored.table === "ATHLETE_LICENCES" ? "id_licence" : "id_affiliation_athlete"
    const result = stored.ids.map(id => data[stored.table].rows.find(item => item.row[key] === id)?.row)
    if (stored.ids.some(id => deletedRecords[stored.table]?.includes(id))) throw new SportsError("SUPPRESSION_VOLONTAIRE", "Un élément de cette opération a été supprimé ou remplacé. La création ne peut pas être rejouée.", 410)
    if (result.some(row => !row)) throw new SportsError("RESULTAT_INCOHERENT", "L’opération est confirmée mais une ligne est absente. Vérification requise.", 503, {}, true)
    invalidateSportsSheets(bookId(book), book === "actors" ? ["ATHLETES"] : book === "licences" ? ["ATHLETE_LICENCES", "COMPTEURS_LICENCES"] : ["ATHLETE_AFFILIATIONS"])
    return result as SportsRow[]
  }
  return {
    completed,
    receipt,
    validatePlans(plans) {
      for (const plan of plans) for (const [name, inserts] of Object.entries(plan.inserts)) {
        const table = tables.get(bookId(plan.book))?.[name]
        if (!table || inserts.some(row => Object.keys(row).some(key => !table.headers.includes(key)))) throw new SportsError("SCHEMA_INCOMPLET", `Colonnes ${name} incompatibles.`, 503)
      }
    },
    async acquire(actorIds, operation, resumeOwn = false) {
      const keys = [...new Set(actorIds)].sort().map(id => `lock:${id}`)
      const owner = JSON.stringify(operation)
      const existing = await search("affiliations", keys, true), held: Metadata[] = [], missing: string[] = []
      for (const key of keys) {
        const matches = existing.filter(item => item.metadataKey === namespace + key)
        if (resumeOwn && matches.length === 1 && matches[0].metadataValue === owner) { held.push(matches[0]); continue }
        if (matches.length) throw new SportsError("ATHLETE_RESERVE", "Une opération est en cours ou d’issue inconnue. La même clé permet de vérifier son résultat ; sans reçu, une récupération contrôlée est nécessaire.", 409)
        missing.push(key)
      }
      const fresh = chooseClaims(missing, missing.map(() => owner), existing)
      if (fresh.length) {
        try { const client = await sportsSheetsClient(); await client.spreadsheets.batchUpdate({ spreadsheetId: bookId("affiliations"), requestBody: { requests: metadataRequests(fresh) } }, options) }
        catch { throw new SportsError("RESERVATION_A_REPRENDRE", "Réservation non confirmée. Reprenez la même tentative ; aucune expiration automatique n’est utilisée.", 503, {}, true) }
      }
      ownedOperationId = operation.id
      return { owner, items: [...held, ...fresh].map(item => ({ id: item.metadataId, key: item.metadataKey })) }
    },
    async release(lease) {
      if (!lease.items.length) return
      const client = await sportsSheetsClient()
      // All lookup fields must match: an old retry must never remove a newer owner's lock.
      await client.spreadsheets.batchUpdate({ spreadsheetId: bookId("affiliations"), requestBody: { requests: lease.items.map(item => ({ deleteDeveloperMetadata: { dataFilter: { developerMetadataLookup: { metadataId: item.id, metadataKey: item.key, metadataValue: lease.owner, visibility: "DOCUMENT" } } } })) } }, options)
    },
    async recoverCompleted(actorIds, operation) {
      await this.release({ owner: JSON.stringify(operation), items: [...new Set(actorIds)].flatMap(actorId => candidateIds(`lock:${actorId}`).map(id => ({ id, key: namespace + `lock:${actorId}` }))) })
    },
    async load(profile = false) {
      const onboarding = profile === true, attachment = profile === "attachment", affiliationOnly = profile === "affiliation", light = profile === "licence" || affiliationOnly || attachment
      const [aff, lic, territory, actors, refs] = await Promise.all([
        readTables(config.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS"]),
        readTables(config.licencesSpreadsheetId, affiliationOnly ? ["ATHLETE_LICENCES"] : ["ATHLETE_LICENCES", "COMPTEURS_LICENCES"], affiliationOnly),
        readTables(config.territorialSpreadsheetId, onboarding ? ["CLUBS", "ENTENTES", "LIGUES"] : ["CLUBS"], light),
        readTables(config.acteursSpreadsheetId, ["ATHLETES"], light),
        readTables(config.referentielsSpreadsheetId, [...(affiliationOnly ? ["TYPES_TRANSFERT", "PARAMETRES_SYSTEME"] : ["SAISON", "STATUT_LICENCE", "TYPES_TRANSFERT", "PARAMETRES_SYSTEME"]), ...(onboarding ? ["SEXES", "STATUTS_SAISON", "STATUTS_AFFILIATION"] : attachment ? ["STATUTS_SAISON"] : [])], light),
      ])
      const rows = (table: Table | undefined) => table ? table.rows.map(item => item.row) : []
      const liveLicences = rows(lic.ATHLETE_LICENCES), licenceIds = new Set(liveLicences.map(row => row.id_licence))
      const licenceMetadata = metadataValues.get(config.licencesSpreadsheetId) || [], affiliationMetadata = metadataValues.get(config.affiliationsSpreadsheetId) || []
      const byKey = new Map(licenceMetadata.map(item => [item.metadataKey, item]))
      const affiliationByKey = new Map(affiliationMetadata.map(item => [item.metadataKey, item]))
      const liveActorSeasons = new Set(liveLicences.map(row => row.id_athlete + ":" + row.id_saison))
      const globalGuard = affiliationByKey.get("fevoco:business-write:v1")
      const parse = (value: string | null | undefined) => { try { return JSON.parse(value || "") } catch { return null } }
      const recoverableLicenceClaims: LicenceClaimReplacement[] = []
      for (const claim of licenceMetadata) {
        const prefix = namespace + "athlete-season:"
        if (!claim.metadataKey?.startsWith(prefix) || !claim.metadataId || !claim.metadataValue) continue
        const actorSeason = claim.metadataKey.slice(prefix.length), actorId = actorSeason.split(":")[0], old = parse(claim.metadataValue)
        if (liveActorSeasons.has(actorSeason)) continue
        const receipt = old?.id ? parse(byKey.get(namespace + "receipt:" + old.id)?.metadataValue) : null
        const lock = affiliationByKey.get(namespace + "lock:" + actorId)
        if (lock && parse(lock.metadataValue)?.id !== ownedOperationId || globalGuard && !globalGuard.metadataValue?.startsWith(ownedOperationId + ":")) continue
        if (!receipt || receipt.table !== "ATHLETE_LICENCES" || receipt.fingerprint !== old.fingerprint || !Array.isArray(receipt.ids) || !receipt.ids.length || receipt.ids.some((id: string) => licenceIds.has(id))) continue
        if (receipt.ids.some((id: string) => parse(byKey.get(namespace + "record:ATHLETE_LICENCES:" + id)?.metadataValue)?.id !== old.id)) continue
        recoverableLicenceClaims.push({ actorSeason, key: "athlete-season:" + actorSeason, metadataId: claim.metadataId, metadataValue: claim.metadataValue, operationId: old.id, retiredIds: receipt.ids })
      }
      const liveNumbers = new Set(liveLicences.map(row => row.id_saison + ":" + row.numero_licence))
      const numberReservations = licenceMetadata.flatMap(item => {
        const match = item.metadataKey?.match(/^fevoco:sports:v1:number:([^:]+):(\d{10,})$/)
        return !match || liveNumbers.has(match[1] + ":" + match[2]) ? [] : [{ id_saison: match[1], numero_licence: match[2], id_club_attribution: match[2].slice(0, 7), compteur_saison: match[2].slice(7) }]
      })
      for (const [table, required] of [[aff.ATHLETE_AFFILIATIONS, ["id_affiliation_athlete", "id_athlete", "id_club", "date_debut", "date_fin", "id_statut_affiliation", "observations", "id_type_transfert", "id_affiliation_precedente"]], [lic.ATHLETE_LICENCES, ["id_licence", "id_athlete", "id_saison", "id_affiliation_athlete", "numero_licence", "date_delivrance", "id_statut_licence", "observations", "id_club_attribution", "compteur_saison"]], [lic.COMPTEURS_LICENCES, ["id_compteur_licence", "id_club", "id_saison", "dernier_compteur", "statut_compteur", "observations"]]] as Array<[Table, string[]]>) if (table && required.some(header => !table.headers.includes(header))) throw new SportsError("SCHEMA_INCOMPLET", "Les colonnes sportives attendues sont absentes.", 503)
      return { recoverableLicenceClaims, reservedAthleteSeasons: (metadataKeys.get(config.licencesSpreadsheetId) || []).filter(key => key.startsWith(namespace + "athlete-season:")).map(key => key.slice((namespace + "athlete-season:").length)), operationActorIds: (metadataKeys.get(config.affiliationsSpreadsheetId) || []).filter(key => key.startsWith(namespace + "lock:")).map(key => key.slice((namespace + "lock:").length)), businessWritePending: (metadataKeys.get(config.affiliationsSpreadsheetId) || []).includes("fevoco:business-write:v1"), affiliations: rows(aff.ATHLETE_AFFILIATIONS), licences: rows(lic.ATHLETE_LICENCES), counters: rows(lic.COMPTEURS_LICENCES), clubs: rows(territory.CLUBS), ententes: onboarding ? rows(territory.ENTENTES) : [], ligues: onboarding ? rows(territory.LIGUES) : [], sexes: onboarding ? rows(refs.SEXES) : [], seasonStatuses: onboarding || attachment ? rows(refs.STATUTS_SAISON) : [], affiliationStatuses: onboarding ? rows(refs.STATUTS_AFFILIATION) : [], athletes: rows(actors.ATHLETES), seasons: rows(refs.SAISON), licenceStatuses: rows(refs.STATUT_LICENCE), transferTypes: rows(refs.TYPES_TRANSFERT), parameters: rows(refs.PARAMETRES_SYSTEME), deletedRecords, deletedLicenceReservations: [...new Map([...deletedLicences, ...numberReservations].map(row => [row.id_saison + ":" + row.numero_licence, row])).values()], reservedRecordIds: {
        ATHLETE_AFFILIATIONS: reservedRecords.get(config.affiliationsSpreadsheetId)?.ATHLETE_AFFILIATIONS || [],
        ATHLETE_LICENCES: reservedRecords.get(config.licencesSpreadsheetId)?.ATHLETE_LICENCES || [],
        ATHLETES: reservedRecords.get(config.acteursSpreadsheetId)?.ATHLETES || [],
      } }
    },
    async contextFor(id) {
      const metadata = await search("affiliations", [`record:ATHLETE_AFFILIATIONS:${id}`])
      if (!metadata.length) return undefined
      const op = JSON.parse(metadata[0].metadataValue) as SportsOperation
      return (await receipt("affiliations", op))?.context
    },
    async commit(operation, plan) {
      const confirmed = await completed(plan.book, operation)
      if (confirmed) return confirmed
      try { return await withBusinessWrite(async () => {
      await assertRecordsAlive([...Object.entries(plan.inserts).map(([table, rows]) => ({ table, rows })), ...plan.updates.map(update => ({ table: update.table, rows: [{ ...update.fields, [update.key]: update.id }] }))])
      const prior = await completed(plan.book, operation)
      if (prior) return prior
      const replacements = plan.claimReplacements || []
      const retired = [...new Set(replacements.flatMap(item => item.retiredIds))]
      const existing = await search(plan.book, [receiptKey(operation), ...plan.claims], true)
      for (const replacement of replacements) {
        const matches = existing.filter(item => item.metadataKey === namespace + replacement.key)
        if (matches.length !== 1 || matches[0].metadataId !== replacement.metadataId || matches[0].metadataValue !== replacement.metadataValue) throw new SportsError("RESERVATION_EXISTANTE", "La réservation a changé. Actualisez avant de reprendre.")
      }
      const retiredKeys = retired.map(id => "deleted:ATHLETE_LICENCES:" + id).filter(key => !existing.some(item => item.metadataKey === namespace + key))
      const keys = [receiptKey(operation), ...plan.claims, ...retiredKeys]
      const stored: SportsReceipt = { fingerprint: operation.fingerprint, table: plan.table, ids: plan.resultIds, context: plan.context, operationDate: plan.operationDate, operationSeason: plan.operationSeason, audit: plan.audit }
      const replacingIds = new Set(replacements.map(item => item.metadataId))
      const metadata = chooseClaims(keys, [JSON.stringify(stored), ...plan.claims.map(() => JSON.stringify(operation)), ...retiredKeys.map(() => JSON.stringify({ reason: "missing-licence-replaced", operationId: operation.id }))], existing.filter(item => !replacingIds.has(item.metadataId)), [...replacingIds])
      const data = tables.get(bookId(plan.book))
      if (!data) throw new SportsError("SOURCE_NON_LUE", "Lecture fraîche obligatoire avant écriture.", 503)
      const requests: sheets_v4.Schema$Request[] = [...replacements.map(item => ({ deleteDeveloperMetadata: { dataFilter: { developerMetadataLookup: { metadataId: item.metadataId, metadataKey: namespace + item.key, metadataValue: item.metadataValue, visibility: "DOCUMENT" } } } })), ...metadataRequests(metadata)]
      const cell = (key: string, value: string): sheets_v4.Schema$CellData => {
        if (["date_debut", "date_fin", "date_delivrance", "date_de_naissance"].includes(key) && value) {
          const date = canonicalDate(value, key)
          return { userEnteredValue: { numberValue: (Date.parse(`${date}T00:00:00Z`) - Date.parse("1899-12-30T00:00:00Z")) / 86400000 }, userEnteredFormat: { numberFormat: { type: "DATE", pattern: "yyyy-mm-dd" } } }
        }
        return { userEnteredValue: { stringValue: value }, userEnteredFormat: { numberFormat: { type: "TEXT" } } }
      }
      for (const update of plan.updates) {
        const table = data[update.table], matches = table?.rows.filter(item => item.row[update.key] === update.id) || []
        if (matches.length !== 1) throw new SportsError("CLE_INCOHERENTE", "La ligne à modifier est absente ou dupliquée.", 503)
        for (const [key, value] of Object.entries(update.fields)) {
          const column = table.headers.indexOf(key)
          if (column < 0) throw new SportsError("COLONNE_ABSENTE", `Colonne ${key} absente.`, 503)
          requests.push({ updateCells: { start: { sheetId: table.sheetId, rowIndex: matches[0].index, columnIndex: column }, rows: [{ values: [cell(key, value)] }], fields: "userEnteredValue,userEnteredFormat.numberFormat" } })
        }
      }
      for (const [name, inserts] of Object.entries(plan.inserts)) if (inserts.length) {
        const table = data[name]
        if (!table || inserts.some(row => Object.keys(row).some(key => !table.headers.includes(key)))) throw new SportsError("COLONNE_ABSENTE", "Colonnes d’ajout incompatibles.", 503)
        requests.push({ appendCells: { sheetId: table.sheetId, rows: inserts.map(row => ({ values: table.headers.map(key => cell(key, row[key] || "")) })), fields: "userEnteredValue,userEnteredFormat.numberFormat" } })
      }
      try { const client = await sportsSheetsClient(); await client.spreadsheets.batchUpdate({ spreadsheetId: bookId(plan.book), requestBody: { requests } }, options) }
      catch (error) {
        try { const applied = await completed(plan.book, operation); if (applied) return applied } catch { throw new SportsError("RESULTAT_INDETERMINE", "Résultat non confirmé. Reprenez avec la même clé ; l’athlète reste réservé.", 503, {}, true) }
        const status = Number((error as { response?: { status?: number } }).response?.status)
        if ([400, 409].includes(status) && /metadata.*(?:already|exist|used)|already.*metadata/i.test(String((error as { message?: unknown }).message || ""))) throw new SportsError("RESERVATION_EXISTANTE", "Une autre attribution a consommé cette réservation.")
        if (status >= 400 && status < 500) throw new SportsError("ECRITURE_REFUSEE", "Le lot atomique a été refusé ; aucune de ses lignes n’a été appliquée. Actualisez et vérifiez les réservations.", 409)
        throw new SportsError("RESULTAT_INDETERMINE", "Résultat non confirmé. Reprenez avec la même clé ; l’athlète reste réservé.", 503, {}, true)
      }
      const confirmed = await completed(plan.book, operation)
      if (!confirmed) throw new SportsError("RESULTAT_INDETERMINE", "Confirmation de l’écriture impossible ; reprenez la même tentative.", 503, {}, true)
      return confirmed
      }, `${operation.id}:${plan.book}`, true) } catch (error) {
        if (error instanceof RecordManagementError) throw new SportsError(error.code === "ECRITURE_EN_COURS" ? "RESERVATION_EXISTANTE" : error.code, error.message, error.status, {}, error.uncertain)
        throw error
      }
    },
  }
}
