import "server-only"
import { AsyncLocalStorage } from "node:async_hooks"
import { randomUUID, createHash } from "node:crypto"
import { env } from "@/lib/env"
import { sportsSheetsClient } from "@/lib/google-sheets"
import { RecordManagementError, rowReferences, type RecordTarget, type BusinessRow } from "@/lib/record-management-model"

export const DELETE_MARKER_PREFIX = "fevoco:deleted:v1:"
const guardKey = "fevoco:business-write:v1"
const guardId = parseInt(createHash("sha256").update(guardKey).digest("hex").slice(0, 7), 16) + 1
const scope = new AsyncLocalStorage<{ owner: string; uncertain: boolean }>()
export const isBusinessWriteActive = () => Boolean(scope.getStore())
const options = { timeout: 20000, retry: false } as const
export type DeleteMarker = { target: RecordTarget; table: string; key: string; book: string; operation: string; fingerprint: string; version: string; actorId: string; at: string; guardOwner: string; numero_licence?: string; id_saison?: string; id_club_attribution?: string; compteur_saison?: string }
export async function businessMetadata() {
  if (!env.googleSheets.affiliationsSpreadsheetId) throw new RecordManagementError("SOURCE_INCOMPLETE", "Le classeur Affiliations est requis pour coordonner les écritures.", 503)
  const client = await sportsSheetsClient()
  return (await client.spreadsheets.get({ spreadsheetId: env.googleSheets.affiliationsSpreadsheetId, fields: "developerMetadata(metadataId,metadataKey,metadataValue)" }, options)).data.developerMetadata || []
}
export function deletionMarkers(metadata: Array<{ metadataKey?: string | null; metadataValue?: string | null }>): DeleteMarker[] {
  return metadata.filter(item => item.metadataKey?.startsWith(DELETE_MARKER_PREFIX)).map(item => {
    try { const value = JSON.parse(item.metadataValue || ""); if (!value.target?.id || !value.table || !value.operation) throw new Error(); return value as DeleteMarker }
    catch { throw new RecordManagementError("JOURNAL_INVALIDE", "La trace des suppressions doit être vérifiée.", 503) }
  })
}
export async function assertRecordsAlive(records: Array<{ table: string; rows: BusinessRow[] }>) {
  const markers = deletionMarkers(await businessMetadata())
  for (const marker of markers) for (const record of records) for (const row of record.rows) {
    if ((record.table === marker.table && row[marker.key] === marker.target.id) || rowReferences(row, marker.target)) throw new RecordManagementError("SUPPRESSION_VOLONTAIRE", "Cet enregistrement a fait l'objet d'une suppression volontaire ou en cours. Il ne peut pas être recréé ou référencé par cette opération.", 410)
    if (record.table === marker.table && row.numero_licence && marker.numero_licence === row.numero_licence && (!marker.id_saison || marker.id_saison === row.id_saison)) throw new RecordManagementError("NUMERO_RESERVE", "Ce numéro supprimé reste réservé et ne peut pas être réattribué.")
  }
}
export async function reservedBusinessIds(table: string): Promise<string[]> {
  return deletionMarkers(await businessMetadata()).filter(marker => marker.table === table).map(marker => marker.target.id)
}
export async function releaseBusinessGuard(owner: string) {
  const client = await sportsSheetsClient()
  const metadata = await businessMetadata()
  if (!metadata.some(item => item.metadataId === guardId && item.metadataKey === guardKey && item.metadataValue === owner)) return
  await client.spreadsheets.batchUpdate({ spreadsheetId: env.googleSheets.affiliationsSpreadsheetId, requestBody: { requests: [{ deleteDeveloperMetadata: { dataFilter: { developerMetadataLookup: { metadataId: guardId, metadataKey: guardKey, metadataValue: owner, visibility: "DOCUMENT" } } } }] } }, options)
}
export async function withBusinessWrite<T>(run: () => Promise<T>, owner: string = randomUUID(), resumeOwn = false): Promise<T> {
  const inherited = scope.getStore()
  if (inherited) {
    try { return await run() }
    catch (error) { const info = error as { uncertain?: boolean; config?: unknown; response?: {status?:number} }; if (info.uncertain || (info.config && !info.response?.status)) inherited.uncertain = true; throw error }
  }
  const client = await sportsSheetsClient()
  const metadata = await businessMetadata()
  const existing = metadata.filter(item => item.metadataId === guardId || item.metadataKey === guardKey)
  const own = resumeOwn && existing.length === 1 && existing[0].metadataId === guardId && existing[0].metadataKey === guardKey && existing[0].metadataValue === owner
  if (existing.length && !own) throw new RecordManagementError("ECRITURE_EN_COURS", "Une écriture est en cours ou doit être vérifiée avant de poursuivre. Rechargez puis réessayez.")
  try {
    if (!own)
    await client.spreadsheets.batchUpdate({ spreadsheetId: env.googleSheets.affiliationsSpreadsheetId, requestBody: { requests: [{ createDeveloperMetadata: { developerMetadata: { metadataId: guardId, metadataKey: guardKey, metadataValue: owner, visibility: "DOCUMENT", location: { spreadsheet: true } } } }] } }, options)
  } catch {
    const confirmed = await businessMetadata().catch(() => [])
    if (!confirmed.some(item => item.metadataKey === guardKey && item.metadataValue === owner)) throw new RecordManagementError("RESERVATION_A_VERIFIER", "Réservation d'écriture non confirmée ; une vérification est nécessaire.", 503, [], true)
  }
  let uncertain = false
  const context = { owner, uncertain: false }
  try {
    const result = await scope.run(context, run)
    if (context.uncertain) throw new RecordManagementError("ECRITURE_INDETERMINEE", "Le résultat doit être vérifié avant une nouvelle écriture.", 503, [], true)
    return result
  }
  catch (error) {
    const info = error as { uncertain?: boolean; code?: string; response?: { status?: number }; config?: unknown }
    uncertain = Boolean(info.uncertain) || Boolean(info.config && !info.response?.status)
    throw error
  } finally {
    if (!uncertain && !context.uncertain) await releaseBusinessGuard(owner)
  }
}
