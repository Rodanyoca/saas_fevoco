import { createHash } from "node:crypto"
// @ts-expect-error Explicit extensions are required by the Node test runner.
import { formatDateForSheet } from "./compact-date.ts"

export type SportsRow = Record<string, string>
export type SportsBook = "affiliations" | "licences"
export type SportsSnapshot = {
  affiliations: SportsRow[]; licences: SportsRow[]; counters: SportsRow[]; clubs: SportsRow[]
  athletes: SportsRow[]; seasons: SportsRow[]; transferTypes: SportsRow[]; licenceStatuses: SportsRow[]
  parameters: SportsRow[]
}
export type SportsOperation = { id: string; fingerprint: string }
export type SportsReceipt = { fingerprint: string; table: string; ids: string[]; context?: TransferContext }
export type TransferContext = { previousEnd: string; previousStatus: string; suspensionId?: string }
export type SportsPlan = {
  book: SportsBook; table: "ATHLETE_AFFILIATIONS" | "ATHLETE_LICENCES"
  inserts: Record<string, SportsRow[]>; updates: Array<{ table: string; key: string; id: string; fields: SportsRow }>
  claims: string[]; resultIds: string[]; context?: TransferContext
}
export class SportsError extends Error {
  constructor(public code: string, message: string, public status = 409, public fields: Record<string, string> = {}, public uncertain = false) { super(message) }
}
export const text = (value: unknown) => String(value ?? "").trim()
export const hash = (value: string) => createHash("sha256").update(value).digest("hex")
export function operation(id: unknown, payload: unknown): SportsOperation {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(text(id))) throw new SportsError("IDEMPOTENCE_REQUISE", "Identifiant de tentative manquant. Rouvrez le formulaire.", 422)
  const ordered = (value: unknown): unknown => Array.isArray(value) ? value.map(ordered) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => [key, ordered(v)])) : value
  return { id: text(id), fingerprint: hash(JSON.stringify(ordered(payload))) }
}
export function canonicalDate(value: unknown, field: string, optional = false): string {
  try { const result = formatDateForSheet(text(value)); if (result || optional) return result } catch { /* Report a field error, never guess. */ }
  throw new SportsError("DATE_INVALIDE", "Veuillez corriger la date.", 422, { [field]: "Date civile complète obligatoire." })
}
export function dayAfter(date: string, days = 1): string {
  const time = new Date(`${date}T12:00:00Z`); time.setUTCDate(time.getUTCDate() + days)
  const result = time.toISOString().slice(0, 10)
  if (result.length !== 10) throw new SportsError("DATE_LIMITE", "Date hors limites.", 422)
  return result
}
export const sportsToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
export function period(row: SportsRow) {
  const start = canonicalDate(row.date_debut, "date_debut"), end = canonicalDate(row.date_fin, "date_fin", true)
  if (end && end < start) throw new SportsError("PERIODE_INVALIDE", "La fin précède le début.", 422, { date_fin: "Fin antérieure au début." })
  return { start, end }
}
export const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) => a.start <= (b.end || "9999-12-31") && b.start <= (a.end || "9999-12-31")
export function occupies(row: SportsRow) { return row.id_statut_affiliation === "SAF001" || (row.id_statut_affiliation === "SAF002" && Boolean(row.date_fin)) }
export function affiliationAt(row: SportsRow, date: string) {
  if (!occupies(row)) return false
  try { const p = period(row); return p.start <= date && (!p.end || p.end >= date) } catch { return false }
}
export function currentSportsClubs(rows: Array<Record<string, unknown>>, today: string): Map<string, string | null> {
  const result = new Map<string, string | null>()
  for (const source of rows) {
    const row = Object.fromEntries(Object.entries(source).map(([key, value]) => [key, text(value)]))
    if (!affiliationAt(row, today) || !row.id_athlete) continue
    result.set(row.id_athlete, result.has(row.id_athlete) ? null : row.id_club)
  }
  return result
}
export function temporalState(row: SportsRow, today: string) {
  if (row.id_statut_affiliation === "SAF004") return "Annulé"
  try { const p = period(row); return p.start > today ? "À venir" : p.end && p.end < today ? "Historique" : row.id_statut_affiliation === "SAF003" ? "Suspendu" : affiliationAt(row, today) ? "Actuel" : "Non renseigné" } catch { return "Dates à vérifier" }
}
export function allocatableClub(snapshot: SportsSnapshot, id: string) {
  const club = snapshot.clubs.find(row => row.id_club === id)
  if (!club) throw new SportsError("CLUB_INTROUVABLE", "Club introuvable.", 422, { id_club: "Club inconnu." })
  if (!/^\d{7}$/.test(id)) throw new SportsError("CLUB_ID_INVALIDE", "L’identifiant du club n’est pas conforme (sept chiffres). Une vérification des références est requise.", 409, { id_club: "Identifiant de club non conforme." })
  return club
}
export function checkConfiguration(snapshot: SportsSnapshot) {
  const config = new Map(snapshot.parameters.map(row => [row.cle_parametre, row.valeur_parametre]))
  if (config.get("TRANSFERT_AFFILIATION_SANS_CHEVAUCHEMENT")?.toUpperCase() !== "TRUE" || config.get("LICENCE_SPORTIVE_NUMEROTATION") !== "CLUB_COMPTEUR_SAISON" || config.get("LICENCE_SPORTIVE_TRANSFERT_CONSERVATION")?.toUpperCase() !== "TRUE") throw new SportsError("CONFIGURATION_SPORTIVE", "Les paramètres sportifs doivent être vérifiés dans le référentiel.", 503)
}
export function nextTechnicalIds(rows: SportsRow[], key: string, prefix: string, count: number) {
  let highest = BigInt(0)
  const pattern = new RegExp(`^${prefix}-(\\d{6,})$`)
  for (const row of rows) { const match = row[key]?.match(pattern); if (match && BigInt(match[1]) > highest) highest = BigInt(match[1]) }
  return Array.from({ length: count }, (_, i) => `${prefix}-${(highest + BigInt(i + 1)).toString().padStart(6, "0")}`)
}
export function assertNoOverlap(rows: SportsRow[]) {
  const sorted = rows.filter(occupies).map(row => ({ row, p: period(row) })).sort((a, b) => a.p.start.localeCompare(b.p.start))
  for (let i = 1; i < sorted.length; i++) if (overlaps(sorted[i - 1].p, sorted[i].p)) throw new SportsError("CHEVAUCHEMENT", "Deux rattachements sportifs se chevauchent, même s’ils concernent des clubs différents.", 409, { date_debut: "Période en conflit.", date_fin: "Période en conflit." })
}
