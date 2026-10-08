import "server-only"
import { env } from "@/lib/env"
import { getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { actorLicencePageData } from "@/lib/actor-licence-creation"

const clean = (value: unknown) => String(value ?? "").trim()
const index = (rows: SheetRow[], key: string): Map<string, SheetRow> => new Map(rows.map((row): [string, SheetRow] => [clean(row[key]), row]).filter(([id]) => Boolean(id)))
const label = (row: SheetRow | undefined, keys: string[], fallback = "—") => keys.map((key) => clean(row?.[key])).find(Boolean) || fallback

export type AthleteLicenceView = { id: string; athlete: string; numero: string; saison: string; club: string; entente: string; ligue: string; sexe: string; dateDelivrance: string; statut: string; athleteId: string; seasonId: string; clubId: string; ententeId: string; ligueId: string; sexId: string; statusId: string; affiliationId?: string; observations?: string }
export type { ActorLicenceView } from "@/lib/actor-licences-model"

async function sources() {
  if (!env.googleSheets.licencesSpreadsheetId) throw new Error("Le classeur 04_FEVOCO_LICENCE n’est pas configuré.")
  const [licences, affiliations, actors, structures, refs] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.licencesSpreadsheetId, ["ATHLETE_LICENCES!A:ZZ", "ACTEURS_LICENCES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS!A:ZZ", "COACH_AFFILIATIONS!A:ZZ", "MEDECIN_AFFILIATIONS!A:ZZ", "OFFICIELS_AFFILIATIONS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.acteursSpreadsheetId, ["ATHLETES!A:ZZ", "COACHS!A:ZZ", "OFFICIELS!A:ZZ", "ARBITRES!A:ZZ", "MEDECINS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["CLUBS!A:ZZ", "ENTENTES!A:ZZ", "LIGUES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:ZZ", "SEXES!A:ZZ", "STATUT_LICENCE!A:ZZ", "CYCLES_LICENCES!A:ZZ", "TYPES_ACTEURS!A:ZZ"]),
  ])
  return { licences, affiliations, actors, structures, refs }
}

export async function athleteLicenceOverview(): Promise<AthleteLicenceView[]> {
  const data = await sources(), athletes = index(data.actors.ATHLETES ?? [], "id_athlete"), affiliations = index(data.affiliations.ATHLETE_AFFILIATIONS ?? [], "id_affiliation_athlete"), clubs = index(data.structures.CLUBS ?? [], "id_club"), ententes = index(data.structures.ENTENTES ?? [], "id_entente"), ligues = index(data.structures.LIGUES ?? [], "id_ligue"), seasons = index(data.refs.SAISON ?? [], "id_saison"), sexes = index(data.refs.SEXES ?? [], "id_sexe"), statuses = index(data.refs.STATUT_LICENCE ?? [], "id_statut_licence")
  return (data.licences.ATHLETE_LICENCES ?? []).map((row) => { const athleteId = clean(row.id_athlete), athlete = athletes.get(athleteId), affiliation = affiliations.get(clean(row.id_affiliation_athlete)), clubId = clean(affiliation?.id_club), club = clubs.get(clubId), ententeId = clean(club?.id_entente), entente = ententes.get(ententeId), ligueId = clean(entente?.id_ligue), sexId = clean(athlete?.id_sexe), seasonId = clean(row.id_saison), statusId = clean(row.id_statut_licence); return { id: clean(row.id_licence), affiliationId: clean(row.id_affiliation_athlete), observations: clean(row.observations), athleteId, athlete: label(athlete, ["nom_complet"], athleteId), numero: clean(row.numero_licence) || "—", seasonId, saison: label(seasons.get(seasonId), ["nom_saison"], seasonId), clubId, club: label(club, ["nom_club"], clubId), ententeId, entente: label(entente, ["nom_entente"], ententeId), ligueId, ligue: label(ligues.get(ligueId), ["nom_ligue"], ligueId), sexId, sexe: label(sexes.get(sexId), ["nom_sexe"], sexId), dateDelivrance: clean(row.date_delivrance), statusId, statut: label(statuses.get(statusId), ["nom_statut_licence"], statusId) } }).filter((row) => row.id)
}

export async function actorLicenceOverview() { return (await actorLicencePageData()).rows }
