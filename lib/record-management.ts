import "server-only"
import { createHash } from "node:crypto"
import { env } from "@/lib/env"
import { sportsSheetsClient, invalidateSportsSheets } from "@/lib/google-sheets"
import { withBusinessWrite, businessMetadata, deletionMarkers, releaseBusinessGuard, DELETE_MARKER_PREFIX, type DeleteMarker } from "@/lib/business-write-guard"
import { families, targetSchema, recordVersion, assertEditableVersion, incomingDependencies, RecordManagementError, type RecordTarget, type TableSnapshot, type BusinessRow } from "@/lib/record-management-model"
import type { sheets_v4 } from "googleapis"

const options = { timeout: 20000, retry: false } as const
const normalizeHeader = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, "_")
const column = (n: number): string => n < 26 ? String.fromCharCode(65 + n) : column(Math.floor(n / 26) - 1) + column(n % 26)
const markerKey = (target: RecordTarget) => DELETE_MARKER_PREFIX + targetSchema(target).table + ":" + target.id
const localMarkerKey = (target: RecordTarget) => "fevoco:sports:v1:deleted:" + targetSchema(target).table + ":" + target.id
const receiptKey = (operation: string) => "fevoco:delete-receipt:v1:" + operation
const metadataId = (key: string, slot: number) => parseInt(createHash("sha256").update(`${key}:${slot}`).digest("hex").slice(0, 7), 16) + 1
function books() {
  const config = env.googleSheets
  return { actors: config.acteursSpreadsheetId, affiliations: config.affiliationsSpreadsheetId, licences: config.licencesSpreadsheetId, competitions: config.competitionsSpreadsheetId, national: config.equipeNationaleSpreadsheetId, activities: config.activitiesSpreadsheetId, documents: config.documentsSpreadsheetId, territory: config.territorialSpreadsheetId, ...(config.spreadsheetId ? { legacy: config.spreadsheetId } : {}) }
}
function bookId(book: string) {
  const id = books()[book as keyof ReturnType<typeof books>]
  if (!id) throw new RecordManagementError("SOURCE_INCOMPLETE", `La source ${book} est requise pour vérifier les dépendances.`, 503)
  return id
}
function mapRows(values: unknown[][]) {
  const headers = (values[0] || []).map(normalizeHeader)
  if (!headers.length || new Set(headers.filter(Boolean)).size !== headers.filter(Boolean).length) throw new RecordManagementError("SCHEMA_INCOMPLET", "Les en-têtes doivent être vérifiés avant mutation.", 503)
  return { headers, rows: values.slice(1).map((row, index) => ({ index: index + 1, row: Object.fromEntries(headers.filter(Boolean).map(key => [key, String(row[headers.indexOf(key)] ?? "").trim()])) })).filter(item => Object.values(item.row).some(Boolean)) }
}
export async function readManagedTarget(target: RecordTarget) {
  const schema = targetSchema(target), client = await sportsSheetsClient(), spreadsheetId = bookId(schema.book)
  const [meta, data] = await Promise.all([
    client.spreadsheets.get({ spreadsheetId, fields: "sheets.properties(sheetId,title,gridProperties),developerMetadata(metadataId,metadataKey,metadataValue)" }, options),
    client.spreadsheets.values.get({ spreadsheetId, range: `'${schema.table}'!A:ZZ`, valueRenderOption: "FORMATTED_VALUE" }, options),
  ])
  const parsed = mapRows(data.data.values || []), matches = parsed.rows.filter(item => item.row[schema.key] === target.id)
  if (matches.length > 1) throw new RecordManagementError("CLE_DUPLIQUEE", "Identifiant dupliqué : mutation refusée.", 409)
  const marker = meta.data.developerMetadata?.find(item => item.metadataKey === localMarkerKey(target))
  const item = matches[0]
  if (!item) throw new RecordManagementError(marker ? "SUPPRESSION_VOLONTAIRE" : "INTROUVABLE", marker ? "Cet enregistrement a été supprimé volontairement." : "Enregistrement introuvable.", marker ? 410 : 404)
  const family = families[target.family]
  if (target.entity === "licence" && target.family !== "athlete" && item.row.id_type_acteur !== family.type) throw new RecordManagementError("INTROUVABLE", "Licence introuvable pour cette famille.", 404)
  const sheetId = meta.data.sheets?.find(sheet => sheet.properties?.title === schema.table)?.properties?.sheetId
  if (sheetId == null) throw new RecordManagementError("SCHEMA_INCOMPLET", "Table introuvable.", 503)
  return { ...schema, spreadsheetId, sheetId, index: item.index, row: item.row, headers: parsed.headers, metadata: meta.data.developerMetadata || [] }
}

/** Fresh identifier columns from every tab of every configured business source. */
export async function dependencySnapshot(target?: RecordTarget): Promise<TableSnapshot[]> {
  const client = await sportsSheetsClient(), configured = books()
  for (const [name, id] of Object.entries(configured)) if (!id) bookId(name)
  const source = target ? targetSchema(target) : undefined
  const distinct = [...new Map(Object.entries(configured).map(([name, id]) => [id, source && id === bookId(source.book) ? source.book : name])).entries()]
  const chunks = await Promise.all(distinct.map(async ([spreadsheetId, book]) => {
    const meta = await client.spreadsheets.get({ spreadsheetId, fields: "sheets.properties(title,gridProperties)" }, options)
    const names = (meta.data.sheets || []).map(sheet => sheet.properties?.title).filter((name): name is string => Boolean(name))
    if (!names.length) throw new RecordManagementError("SOURCE_INCOMPLETE", `Aucune table lisible dans ${book}.`, 503)
    const headers = await client.spreadsheets.values.batchGet({ spreadsheetId, ranges: names.map(name => `'${name.replace(/'/g, "''")}'!1:1`) }, options)
    if (headers.data.valueRanges?.length !== names.length) throw new RecordManagementError("SOURCE_INCOMPLETE", "Lecture des en-têtes incomplète.", 503)
    const ranges: string[] = [], descriptors: Array<{ name: string; header: string }> = []
    names.forEach((name, index) => {
      const keys = (headers.data.valueRanges?.[index]?.values?.[0] || []).map(normalizeHeader)
      if (!keys.some(Boolean) || new Set(keys.filter(Boolean)).size !== keys.filter(Boolean).length) throw new RecordManagementError("SCHEMA_INCOMPLET", `En-têtes absents ou ambigus dans ${name}.`, 503)
      keys.forEach((key, columnIndex) => { if (/^id_|_id$|^type_(?:acteur|participant|proprietaire)$/.test(key)) { ranges.push(`'${name.replace(/'/g, "''")}'!${column(columnIndex)}2:${column(columnIndex)}`); descriptors.push({ name, header: key }) } })
    })
    if (!ranges.length) return []
    const data = await client.spreadsheets.values.batchGet({ spreadsheetId, ranges, valueRenderOption: "FORMATTED_VALUE" }, options)
    if (data.data.valueRanges?.length !== ranges.length) throw new RecordManagementError("SOURCE_INCOMPLETE", "Lecture des relations incomplète.", 503)
    const tables = new Map<string, TableSnapshot>()
    descriptors.forEach((description, index) => {
      const table = tables.get(description.name) || { book, table: description.name, headers: [], rows: [] }
      table.headers.push(description.header)
      for (const [rowIndex, values] of (data.data.valueRanges?.[index]?.values || []).entries()) (table.rows[rowIndex] ??= {})[description.header] = String(values[0] ?? "").trim()
      tables.set(description.name, table)
    })
    return [...tables.values()]
  }))
  return chunks.flat()
}
function describe(target: RecordTarget, row: BusinessRow) {
  return target.entity === "actor" ? row.nom_complet || row.nom_complet_athlete || target.id : target.entity === "licence" ? `Licence ${row.numero_licence || target.id} · ${row.id_saison || row.id_cycle_licence || "Période"}` : `Affiliation ${row.id_club || row.id_entite || "Fédération"} · ${row.date_debut || "Date inconnue"} → ${row.date_fin || "ouverte"}`
}
async function checkOperations(target: RecordTarget, row: BusinessRow) {
  const metadata = await businessMetadata(), family = families[target.family]
  const actorId = target.entity === "actor" ? target.id : row[family.key] || row.id_acteur
  if (actorId && metadata.some(item => item.metadataKey === `fevoco:sports:v1:lock:${actorId}`)) throw new RecordManagementError("OPERATION_EN_COURS", "Une opération sportive réserve cet acteur. Terminez ou vérifiez-la avant la suppression.")
  const client = await sportsSheetsClient()
  const actorMeta = (await client.spreadsheets.get({ spreadsheetId: bookId("actors"), fields: "developerMetadata(metadataKey,metadataValue)" }, options)).data.developerMetadata || []
  const sourceKeys = new Set(metadata.map(item => item.metadataKey))
  const licenceKeys = new Set(((await client.spreadsheets.get({ spreadsheetId: bookId("licences"), fields: "developerMetadata(metadataKey)" }, options)).data.developerMetadata || []).map(item => item.metadataKey))
  for (const item of actorMeta) if (item.metadataKey?.startsWith("fevoco:sports:v1:receipt:")) {
    let receipt
    try { receipt = JSON.parse(item.metadataValue || "") } catch { throw new RecordManagementError("JOURNAL_INVALIDE", "Les reçus doivent être vérifiés.", 503) }
    if (receipt.ids?.includes(actorId) && receipt.audit?.action?.startsWith("ATHLETE_REGISTRATION") && (!sourceKeys.has(item.metadataKey) || !licenceKeys.has(item.metadataKey))) throw new RecordManagementError("CREATION_INCOMPLETE", "La création unifiée est incomplète. Reprenez-la avant de supprimer ses éléments.")
  }
}
export async function previewManagedRecord(target: RecordTarget, versionOnly = false) {
  const source = await readManagedTarget(target)
  const dependencies = versionOnly ? [] : incomingDependencies(target, await dependencySnapshot(target))
  let operationError = ""
  if (!versionOnly) try { await checkOperations(target, source.row) } catch (error) { if (error instanceof RecordManagementError && error.status === 409) operationError = error.message; else throw error }
  return { target, label: describe(target, source.row), version: recordVersion(source.row), dependencies, blocked: Boolean(dependencies.length || operationError), operationError }
}
function claim(key: string, value: string, existing: Array<{ metadataId?: number | null; metadataKey?: string | null }>): sheets_v4.Schema$Request {
  if (existing.some(item => item.metadataKey === key)) throw new RecordManagementError("SUPPRESSION_EN_COURS", "Une autre tentative réserve déjà cette suppression.")
  const id = Array.from({ length: 8 }, (_, slot) => metadataId(key, slot)).find(candidate => !existing.some(item => item.metadataId === candidate))
  if (!id) throw new RecordManagementError("COLLISION_RESERVATION", "La réservation technique doit être vérifiée.", 503)
  existing.push({ metadataId: id, metadataKey: key })
  return { createDeveloperMetadata: { developerMetadata: { metadataId: id, metadataKey: key, metadataValue: value, visibility: "DOCUMENT", location: { spreadsheet: true } } } }
}
async function existingDeletion(target: RecordTarget, operation: string, fingerprint: string) {
  const schema = targetSchema(target), client = await sportsSheetsClient()
  const metadata = (await client.spreadsheets.get({ spreadsheetId: bookId(schema.book), fields: "developerMetadata(metadataKey,metadataValue)" }, options)).data.developerMetadata || []
  const item = metadata.find(row => row.metadataKey === receiptKey(operation))
  if (!item) return null
  const receipt = JSON.parse(item.metadataValue || "") as DeleteMarker
  if (receipt.fingerprint !== fingerprint) throw new RecordManagementError("IDEMPOTENCE_CONFLIT", "Cette tentative est liée à une autre suppression.")
  try { await readManagedTarget(target); throw new RecordManagementError("JOURNAL_INCOHERENT", "La suppression est confirmée mais la ligne existe : vérification requise.", 503) }
  catch (error) { if (!(error instanceof RecordManagementError) || error.code !== "SUPPRESSION_VOLONTAIRE") throw error }
  await releaseBusinessGuard(receipt.guardOwner)
  invalidateSportsSheets(bookId(schema.book), [schema.table])
  return { deleted: true as const, target }
}
export async function deleteManagedRecord(target: RecordTarget, expected: string, operation: string, userId: string) {
  targetSchema(target)
  if (!/^[a-f0-9-]{36}$/i.test(operation) || !userId || !/^[a-f0-9]{64}$/i.test(expected)) throw new RecordManagementError("COMMANDE_INVALIDE", "Version et identifiant de tentative requis.", 422)
  const fingerprint = recordVersion({ ...target, expected, userId })
  const prior = await existingDeletion(target, operation, fingerprint)
  if (prior) return prior
  const owner = `delete:${operation}`
  return withBusinessWrite(async () => {
    const applied = await existingDeletion(target, operation, fingerprint)
    if (applied) return applied
    const source = await readManagedTarget(target)
    assertEditableVersion(source.row, expected)
    const dependencies = incomingDependencies(target, await dependencySnapshot(target))
    if (dependencies.length) throw new RecordManagementError("DEPENDANCES_EXISTANTES", "La suppression est bloquée par des références. Conservez l'historique ou utilisez l'annulation lorsque cette action est disponible.", 409, dependencies)
    await checkOperations(target, source.row)
    const marker: DeleteMarker = { target, table: source.table, key: source.key, book: source.book, operation, fingerprint, version: expected, actorId: userId, at: new Date().toISOString(), guardOwner: owner,
      ...(target.entity === "licence" ? { numero_licence: source.row.numero_licence || "", id_saison: source.row.id_saison || "", id_club_attribution: source.row.id_club_attribution || "", compteur_saison: source.row.compteur_saison || "" } : {}) }
    const client = await sportsSheetsClient(), central = await businessMetadata()
    const priorMarker = deletionMarkers(central).find(item => item.table === source.table && item.target.id === target.id)
    if (priorMarker && priorMarker.fingerprint !== fingerprint) throw new RecordManagementError("SUPPRESSION_EN_COURS", "Reprenez la tentative de suppression déjà engagée.")
    if (!priorMarker) await client.spreadsheets.batchUpdate({ spreadsheetId: bookId("affiliations"), requestBody: { requests: [claim(markerKey(target), JSON.stringify(marker), central)] } }, options)
    const requests: sheets_v4.Schema$Request[] = [claim(localMarkerKey(target), JSON.stringify(marker), source.metadata), claim(receiptKey(operation), JSON.stringify(marker), source.metadata), {
      // Remove the business row's values without shifting other records' positions.
      updateCells: { range: { sheetId: source.sheetId, startRowIndex: source.index, endRowIndex: source.index + 1, startColumnIndex: 0, endColumnIndex: source.headers.length }, rows: [{ values: source.headers.map(() => ({ userEnteredValue: { stringValue: "" } })) }], fields: "userEnteredValue" },
    }]
    try { await client.spreadsheets.batchUpdate({ spreadsheetId: source.spreadsheetId, requestBody: { requests } }, options) }
    catch (error) {
      const confirmed = await existingDeletion(target, operation, fingerprint).catch(() => null)
      if (confirmed) return confirmed
      if (Number((error as { response?: { status?: number } }).response?.status) >= 400 && Number((error as { response?: { status?: number } }).response?.status) < 500) throw new RecordManagementError("ECRITURE_REFUSEE", "Le lot a été refusé. Reprenez la même tentative après vérification.")
      throw new RecordManagementError("SUPPRESSION_INDETERMINEE", "Résultat non confirmé. Vérifiez la même tentative avant toute nouvelle suppression.", 503, [], true)
    }
    invalidateSportsSheets(source.spreadsheetId, [source.table])
    return { deleted: true as const, target }
  }, owner)
}
