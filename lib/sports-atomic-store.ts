import "server-only"
import type { sheets_v4 } from "googleapis"
import { env } from "@/lib/env"
import { sportsSheetsClient, invalidateSportsSheets } from "@/lib/google-sheets"
import { withBoundedRetry } from "@/lib/google-sheets-resilience"
import { SportsError, canonicalDate, hash, type SportsBook, type SportsOperation, type SportsPlan, type SportsReceipt, type SportsRow, type SportsSnapshot, type TransferContext } from "@/lib/sports-model"

type Metadata = { metadataId: number; metadataKey: string; metadataValue: string }
type Table = { sheetId: number; headers: string[]; rows: Array<{ index: number; row: SportsRow }> }
export type SportsLease = { owner: string; items: Array<{ id: number; key: string }> }
export interface SportsStore {
  acquire(actorIds: string[], operation: SportsOperation): Promise<SportsLease>
  release(lease: SportsLease): Promise<void>
  load(): Promise<SportsSnapshot>
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
  const bookIds = { affiliations: config.affiliationsSpreadsheetId, licences: config.licencesSpreadsheetId }
  const tables = new Map<string, Record<string, Table>>()
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
  function chooseClaims(keys: string[], values: string[], existing: Metadata[]) {
    const used = new Set(existing.map(item => item.metadataId))
    return keys.map((key, index) => {
      if (existing.some(item => item.metadataKey === namespace + key)) throw new SportsError("RESERVATION_EXISTANTE", "Une réservation persistante existe déjà. Actualisez ou reprenez la même tentative.")
      const id = candidateIds(key).find(candidate => !used.has(candidate))
      if (!id) throw new SportsError("COLLISION_RESERVATION", "Les identifiants de réservation doivent être vérifiés.", 503)
      used.add(id)
      return { metadataId: id, metadataKey: namespace + key, metadataValue: values[index] }
    })
  }
  const metadataRequests = (items: Metadata[]): sheets_v4.Schema$Request[] => items.map(item => ({ createDeveloperMetadata: { developerMetadata: { ...item, visibility: "DOCUMENT", location: { spreadsheet: true } } } }))
  async function readTables(spreadsheetId: string, names: string[]) {
    if (!spreadsheetId || !config.clientEmail || !config.privateKey) throw new SportsError("SOURCE_NON_CONFIGUREE", "Un classeur sportif n’est pas configuré.", 503)
    const client = await sportsSheetsClient()
    const meta = await withBoundedRetry(() => client.spreadsheets.get({ spreadsheetId, fields: "sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))" }, options))
    const properties = new Map((meta.data.sheets || []).map(sheet => [sheet.properties?.title, sheet.properties]))
    for (const name of names) if (!properties.get(name)) throw new SportsError("SCHEMA_INCOMPLET", `Onglet ${name} absent.`, 503)
    const column = (n: number): string => n <= 26 ? String.fromCharCode(64 + n) : column(Math.floor((n - 1) / 26)) + column((n - 1) % 26 + 1)
    const ranges = names.map(name => `'${name}'!A1:${column(Math.min(properties.get(name)?.gridProperties?.columnCount || 1, 52))}${properties.get(name)?.gridProperties?.rowCount || 1}`)
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
    return stored
  }
  async function completed(book: SportsBook, operation: SportsOperation) {
    const stored = await receipt(book, operation)
    if (!stored) return null
    const data = await readTables(bookId(book), [stored.table])
    const key = stored.table === "ATHLETE_LICENCES" ? "id_licence" : "id_affiliation_athlete"
    const result = stored.ids.map(id => data[stored.table].rows.find(item => item.row[key] === id)?.row)
    if (result.some(row => !row)) throw new SportsError("RESULTAT_INCOHERENT", "L’opération est confirmée mais une ligne est absente. Vérification requise.", 503, {}, true)
    invalidateSportsSheets(bookId(book), book === "licences" ? ["ATHLETE_LICENCES", "COMPTEURS_LICENCES"] : ["ATHLETE_AFFILIATIONS"])
    return result as SportsRow[]
  }
  return {
    completed,
    async acquire(actorIds, operation) {
      const keys = [...new Set(actorIds)].sort().map(id => `lock:${id}`)
      const owner = JSON.stringify(operation)
      const existing = await search("affiliations", keys, true), held: Metadata[] = [], missing: string[] = []
      for (const key of keys) {
        const matches = existing.filter(item => item.metadataKey === namespace + key)
        if (matches.length) throw new SportsError("ATHLETE_RESERVE", "Une opération est en cours ou d’issue inconnue. La même clé permet de vérifier son résultat ; sans reçu, une récupération contrôlée est nécessaire.", 409)
        missing.push(key)
      }
      const fresh = chooseClaims(missing, missing.map(() => owner), existing)
      if (fresh.length) {
        try { const client = await sportsSheetsClient(); await client.spreadsheets.batchUpdate({ spreadsheetId: bookId("affiliations"), requestBody: { requests: metadataRequests(fresh) } }, options) }
        catch { throw new SportsError("RESERVATION_A_REPRENDRE", "Réservation non confirmée. Reprenez la même tentative ; aucune expiration automatique n’est utilisée.", 503, {}, true) }
      }
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
    async load() {
      const [aff, lic, territory, actors, refs] = await Promise.all([
        readTables(config.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS"]),
        readTables(config.licencesSpreadsheetId, ["ATHLETE_LICENCES", "COMPTEURS_LICENCES"]),
        readTables(config.territorialSpreadsheetId, ["CLUBS"]),
        readTables(config.acteursSpreadsheetId, ["ATHLETES"]),
        readTables(config.referentielsSpreadsheetId, ["SAISON", "STATUT_LICENCE", "TYPES_TRANSFERT", "PARAMETRES_SYSTEME"]),
      ])
      const rows = (table: Table) => table.rows.map(item => item.row)
      for (const [table, required] of [[aff.ATHLETE_AFFILIATIONS, ["id_affiliation_athlete", "id_athlete", "id_club", "date_debut", "date_fin", "id_statut_affiliation", "observations", "id_type_transfert", "id_affiliation_precedente"]], [lic.ATHLETE_LICENCES, ["id_licence", "id_athlete", "id_saison", "id_affiliation_athlete", "numero_licence", "date_delivrance", "id_statut_licence", "observations", "id_club_attribution", "compteur_saison"]], [lic.COMPTEURS_LICENCES, ["id_compteur_licence", "id_club", "id_saison", "dernier_compteur", "statut_compteur", "observations"]]] as Array<[Table, string[]]>) if (required.some(header => !table.headers.includes(header))) throw new SportsError("SCHEMA_INCOMPLET", "Les colonnes sportives attendues sont absentes.", 503)
      return { affiliations: rows(aff.ATHLETE_AFFILIATIONS), licences: rows(lic.ATHLETE_LICENCES), counters: rows(lic.COMPTEURS_LICENCES), clubs: rows(territory.CLUBS), ententes: [], athletes: rows(actors.ATHLETES), seasons: rows(refs.SAISON), licenceStatuses: rows(refs.STATUT_LICENCE), transferTypes: rows(refs.TYPES_TRANSFERT), parameters: rows(refs.PARAMETRES_SYSTEME) }
    },
    async contextFor(id) {
      const metadata = await search("affiliations", [`record:ATHLETE_AFFILIATIONS:${id}`])
      if (!metadata.length) return undefined
      const op = JSON.parse(metadata[0].metadataValue) as SportsOperation
      return (await receipt("affiliations", op))?.context
    },
    async commit(operation, plan) {
      const prior = await completed(plan.book, operation)
      if (prior) return prior
      const keys = [receiptKey(operation), ...plan.claims]
      const stored: SportsReceipt = { fingerprint: operation.fingerprint, table: plan.table, ids: plan.resultIds, context: plan.context }
      const metadata = chooseClaims(keys, [JSON.stringify(stored), ...plan.claims.map(() => JSON.stringify(operation))], await search(plan.book, keys, true))
      const data = tables.get(bookId(plan.book))
      if (!data) throw new SportsError("SOURCE_NON_LUE", "Lecture fraîche obligatoire avant écriture.", 503)
      const requests = metadataRequests(metadata)
      const cell = (key: string, value: string): sheets_v4.Schema$CellData => {
        if (["date_debut", "date_fin", "date_delivrance"].includes(key) && value) {
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
    },
  }
}
