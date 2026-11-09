import "server-only"

import { env } from "@/lib/env"
import { getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { mutateSeasonalLicence } from "@/lib/sports-mutations"
import { sportsWritesEnabled, sportsWriteBlockReason } from "@/lib/sports-atomic-store"
import { athleteAffiliationClubId, athleteAffiliationClubName } from "@/lib/athlete-affiliation-fields"

const clean = (value: unknown) => String(value ?? "").trim()
const first = (row: SheetRow, ...keys: string[]) => keys.map((key) => clean(row[key])).find(Boolean) ?? ""

async function source() {
  const [licences, affiliations, actors, structures, references] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.licencesSpreadsheetId, ["COMPTEURS_LICENCES!A:F"]),
    getSheetsDataFrom(env.googleSheets.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.acteursSpreadsheetId, ["ATHLETES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["CLUBS!A:ZZ", "ENTENTES!A:ZZ", "LIGUES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:ZZ", "STATUT_LICENCE!A:ZZ", "STATUTS_AFFILIATION!A:ZZ"]),
  ])
  return { licences, affiliations, actors, structures, references }
}

export type AthleteLicenceCandidate = {
  affiliationId: string
  athleteId: string
  athleteName: string
  clubId: string
  affiliationStatus: string
  dateDebut: string
  dateFin: string
}

export async function athleteLicenceCreationOptions() {
  const data = await source()
  const athletes = new Map((data.actors.ATHLETES ?? []).map((row) => [clean(row.id_athlete), row]))
  const clubs = new Map((data.structures.CLUBS ?? []).map((row) => [clean(row.id_club), row]))
  const ententes = new Map((data.structures.ENTENTES ?? []).map(row => [clean(row.id_entente), row]))
  const ligues = new Map((data.structures.LIGUES ?? []).map(row => [clean(row.id_ligue), row]))
  const affiliationRows = data.affiliations.ATHLETE_AFFILIATIONS ?? []
  const candidates: AthleteLicenceCandidate[] = affiliationRows.flatMap((row) => {
    const affiliationId = first(row, "id_affiliation_athlete", "id_affiliation")
    const athleteId = first(row, "id_athlete", "athlete_id", "id_acteur")
    const clubId = athleteAffiliationClubId(row)
    const athlete = athletes.get(athleteId)
    if (!affiliationId || !athlete || !clubId) return []
    return [{
      affiliationId,
      athleteId,
      athleteName: first(athlete, "nom_complet", "nom_complet_athlete") || athleteId,
      clubId,
      affiliationStatus: first((data.references.STATUTS_AFFILIATION ?? []).find(item => clean(item.id_statut_affiliation) === clean(row.id_statut_affiliation)) || row, "nom_statut_affiliation", "statut_affiliation", "id_statut_affiliation", "statut") || "Non renseigné",
      dateDebut: clean(row.date_debut),
      dateFin: clean(row.date_fin),
    }]
  })
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
