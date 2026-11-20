// @ts-expect-error Explicit extension required by the Node test runner.
import { SportsError, affiliationAt, allocatableClub, canonicalDate, type SportsSnapshot, type SportsRow } from "./sports-model.ts"

export type LicenceSelection = { clubId: string; seasonId: string; date: string }
export function licenceEligibilityIndex(s: SportsSnapshot, seasonId: string, rawDate: string) {
  const season = s.seasons.find(row => row.id_saison === seasonId)
  if (!season) throw new SportsError("SAISON_INTROUVABLE", "Saison introuvable.", 422)
  const date = canonicalDate(rawDate, "date_delivrance")
  const people = new Set<string>(), numbers = new Set<string>(), effective = new Map<string, number>()
  for (const row of s.licences) if (row.id_saison === seasonId) {
    if ((row.numero_licence && numbers.has(row.numero_licence))) throw new SportsError("HISTORIQUE_DOUBLON", "L'historique de la saison contient un doublon à vérifier.")
    people.add(row.id_athlete); if (row.numero_licence) numbers.add(row.numero_licence)
  }
  for (const row of s.affiliations) if (affiliationAt(row, date)) effective.set(row.id_athlete, (effective.get(row.id_athlete) || 0) + 1)
  const recoverable = new Set(s.recoverableLicenceClaims?.map(claim => claim.actorSeason))
  return { date, people, numbers, effective, athletes: new Set(s.athletes.map(row => row.id_athlete)), affiliations: new Map(s.affiliations.map(row => [row.id_affiliation_athlete, row])), claims: new Set((s.reservedAthleteSeasons || []).filter(key => !recoverable.has(key))) }
}
export function assertAthleteLicenceEligible(s: SportsSnapshot, index: ReturnType<typeof licenceEligibilityIndex>, affiliation: SportsRow | undefined, seasonId: string, athleteId: string, clubId?: string) {
  if (!affiliation || affiliation.id_statut_affiliation !== "SAF001" || !affiliationAt(affiliation, index.date) || affiliation.id_athlete !== athleteId || (clubId && affiliation.id_club !== clubId)) throw new SportsError("AFFILIATION_INADMISSIBLE", "Une affiliation active du bon athlète et du bon club, effective à la délivrance, est obligatoire.")
  if (!index.athletes.has(athleteId)) throw new SportsError("ATHLETE_INTROUVABLE", "Athlète introuvable.", 404)
  allocatableClub(s, affiliation.id_club)
  if (index.effective.get(athleteId) !== 1) throw new SportsError("RATTACHEMENT_AMBIGU", "Plusieurs rattachements sont effectifs à cette date.")
  if (index.people.has(athleteId)) throw new SportsError("LICENCE_EXISTANTE", "Cet athlète possède déjà une licence pour cette saison, quel que soit son statut ou son club.")
  if (index.claims.has(`${athleteId}:${seasonId}`)) throw new SportsError("DELIVRANCE_RESERVEE", "Une délivrance ou une réservation historique existe pour cet athlète et cette saison. Vérifiez ou reprenez l'opération existante.")
  return affiliation
}
