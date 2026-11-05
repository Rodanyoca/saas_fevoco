import type { SheetRow } from "./google-sheets"
// @ts-expect-error Explicit extension required by the Node test runner.
import { formatDateForSheet } from "./compact-date.ts"

const text = (value: unknown) => String(value ?? "").trim()
export const competitionAffiliationDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
// Athlete profiles contain identity only. The current club is an affiliation, never a licence prefix.
export function competitionAthleteClubs(rows: SheetRow[], today: string): Map<string, string> {
  const clubs = new Map<string, Set<string>>()
  for (const row of rows) {
    if (text(row.id_statut_affiliation) !== "SAF001") continue
    const actorId = text(row.id_athlete), clubId = text(row.id_club)
    if (!actorId || !clubId) continue
    try {
      const start = formatDateForSheet(text(row.date_debut)), end = formatDateForSheet(text(row.date_fin))
      if (!start || start > today || end && (end < today || end < start)) continue
      if (!clubs.has(actorId)) clubs.set(actorId, new Set())
      clubs.get(actorId)!.add(clubId)
    } catch { /* An invalid date cannot establish eligibility for an engaged club. */ }
  }
  return new Map([...clubs].filter(([, ids]) => ids.size === 1).map(([id, ids]) => [id, [...ids][0]]))
}
