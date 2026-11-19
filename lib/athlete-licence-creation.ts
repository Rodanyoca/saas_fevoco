import "server-only"

import { env } from "@/lib/env"
import { getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { mutateSeasonalLicence } from "@/lib/sports-mutations"
import { createGoogleSportsStore, sportsWritesEnabled, sportsWriteBlockReason } from "@/lib/sports-atomic-store"
import { licenceEligibilityIndex, assertAthleteLicenceEligible, type LicenceSelection } from "@/lib/athlete-licence-eligibility"
import { allocateSportsLicences } from "@/lib/sports-licences-domain"
import { SportsError } from "@/lib/sports-model"
import { athleteAffiliationClubId, athleteAffiliationClubName } from "@/lib/athlete-affiliation-fields"

const clean = (value: unknown) => String(value ?? "").trim()
const first = (row: SheetRow, ...keys: string[]) => keys.map((key) => clean(row[key])).find(Boolean) ?? ""

async function source() {
  const [licences, affiliations, structures, references] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.licencesSpreadsheetId, ["COMPTEURS_LICENCES!A:F"]),
    getSheetsDataFrom(env.googleSheets.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["CLUBS!A:ZZ", "ENTENTES!A:ZZ", "LIGUES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:ZZ", "STATUT_LICENCE!A:ZZ"]),
  ])
  return { licences, affiliations, structures, references }
}

export type AthleteLicenceCandidate = {
  affiliationId: string
  athleteId: string
  athleteName: string
  clubId: string
  affiliationStatus: string
  dateDebut: string
  dateFin: string
  renewable?: boolean
}

export async function athleteLicenceCandidates(selection: LicenceSelection) {
  const snapshot = await createGoogleSportsStore().load(), index = licenceEligibilityIndex(snapshot, selection.seasonId, selection.date)
  if (snapshot.businessWritePending) throw new SportsError("ECRITURE_EN_COURS", "Une écriture est en cours ou doit être vérifiée. Réessayez après sa confirmation.")
  const names = new Map(snapshot.athletes.map(row => [row.id_athlete, row.nom_complet || row.nom_complet_athlete || row.id_athlete]))
  const locks = new Set(snapshot.operationActorIds), previous = new Set(snapshot.licences.filter(row => row.id_saison !== selection.seasonId).map(row => row.id_athlete))
  const candidates: AthleteLicenceCandidate[] = [], conflicts: Array<{ athleteId: string; code: string }> = []
  for (const row of snapshot.affiliations) if (row.id_club === selection.clubId) {
    try {
      assertAthleteLicenceEligible(snapshot, index, row, selection.seasonId, row.id_athlete, selection.clubId)
      if (locks.has(row.id_athlete)) throw new SportsError("ATHLETE_RESERVE", "Une opération doit être terminée ou reprise.")
      candidates.push({ affiliationId: row.id_affiliation_athlete, athleteId: row.id_athlete, athleteName: names.get(row.id_athlete)!, clubId: row.id_club, affiliationStatus: "ACTIF", dateDebut: row.date_debut, dateFin: row.date_fin, renewable: previous.has(row.id_athlete) })
    } catch (error) { if (!(error instanceof SportsError)) throw error; conflicts.push({ athleteId: row.id_athlete, code: error.code }) }
  }
  // Dry plan validates the shared club/season counter and historical numbers once, without claiming anything.
  if (candidates.length) allocateSportsLicences(snapshot, { id_athlete: candidates[0].athleteId, id_affiliation_athlete: candidates[0].affiliationId, id_club: selection.clubId, id_saison: selection.seasonId, date_delivrance: index.date, id_statut_licence: "STL001" })
  return { candidates: [...new Map(candidates.map(item => [item.athleteId, item])).values()].sort((a, b) => a.athleteName.localeCompare(b.athleteName, "fr")), conflicts }
}
export function athleteLicenceCreationOptions(selection: LicenceSelection): ReturnType<typeof athleteLicenceCandidates>
export function athleteLicenceCreationOptions(): ReturnType<typeof initialOptions>
export function athleteLicenceCreationOptions(selection?: LicenceSelection) { return selection ? athleteLicenceCandidates(selection) : initialOptions() }
async function initialOptions() {
  const data = await source()
  const clubs = new Map((data.structures.CLUBS ?? []).map((row) => [clean(row.id_club), row]))
  const ententes = new Map((data.structures.ENTENTES ?? []).map(row => [clean(row.id_entente), row]))
  const ligues = new Map((data.structures.LIGUES ?? []).map(row => [clean(row.id_ligue), row]))
  const affiliationRows = data.affiliations.ATHLETE_AFFILIATIONS ?? []
  const candidates: AthleteLicenceCandidate[] = [] // Loaded freshly only for the selected club/season.
  const historicalClubs = affiliationRows.map((row) => {
    const id = athleteAffiliationClubId(row)
    return { id, label: athleteAffiliationClubName(row) || id }
  }).filter((item) => item.id)
  const clubOptions = new Map([
    ...historicalClubs.map((item) => [item.id, item] as const),
    ...[...clubs.entries()].filter(([id]) => Boolean(id)).map(([id, row]) => [id, { id, label: first(row, "nom_club") || id }] as const),
  ])
  return {
    sportsWritesEnabled: sportsWritesEnabled(),
    sportsWriteBlockReason,
    counters: (data.licences.COMPTEURS_LICENCES ?? []).map(row => ({ clubId: clean(row.id_club), seasonId: clean(row.id_saison), status: clean(row.statut_compteur) })),
    clubs: [...clubOptions.values()].map(item => {
      const club = clubs.get(item.id), ententeId = clean(club?.id_entente), entente = ententes.get(ententeId), ligueId = clean(entente?.id_ligue)
      return { ...item, ententeId, entente: first(entente || {}, "nom_entente"), ligueId, ligue: first(ligues.get(ligueId) || {}, "nom_ligue") }
    }).sort((a, b) => a.label.localeCompare(b.label, "fr")),
    seasons: (data.references.SAISON ?? []).map((row) => ({ id: clean(row.id_saison), label: first(row, "nom_saison") || clean(row.id_saison) })).filter((item) => item.id),
    statuses: (data.references.STATUT_LICENCE ?? []).map((row) => ({ id: clean(row.id_statut_licence), label: first(row, "nom_statut_licence") || clean(row.id_statut_licence) })).filter((item) => item.id),
    candidates: candidates.sort((a, b) => a.athleteName.localeCompare(b.athleteName, "fr") || b.dateDebut.localeCompare(a.dateDebut)),
  }
}

export const createAthleteLicence = async (input: unknown) => (await mutateSeasonalLicence(input))[0]
export const updateAthleteLicence = async (id: string, input: unknown) => (await mutateSeasonalLicence(input, id))[0]
export const renewClubLicences = (input: unknown) => mutateSeasonalLicence(input)
