import "server-only"
import { env } from "@/lib/env"
import { getSheetsDataFrom } from "@/lib/google-sheets"
import { formatDateFromSheet } from "@/lib/compact-date"
import { buildClubActorIndex, type ClubActorsBundle } from "@/lib/club-actors-model"
import { mapAthleteLicence, mapLicence } from "@/lib/mappers/actor-records"
import { activeActorLicenceNumbers } from "@/lib/active-actor-licences"

export async function loadClubActors(clubId?: string): Promise<ClubActorsBundle> {
  const config = env.googleSheets
  if (!config.acteursSpreadsheetId || !config.affiliationsSpreadsheetId || !config.referentielsSpreadsheetId || !config.clientEmail || !config.privateKey) throw new Error("Les sources des acteurs et affiliations ne sont pas configurées.")
  // La panne du classeur des licences ne doit pas masquer les rattachements.
  const licenceSources = config.licencesSpreadsheetId ? Promise.all([
    getSheetsDataFrom(config.licencesSpreadsheetId, ["ATHLETE_LICENCES!A:Z", "ACTEURS_LICENCES!A:Z"]),
    getSheetsDataFrom(config.referentielsSpreadsheetId, ["SAISON!A:ZZ"]),
  ]).catch(() => null) : Promise.resolve(null)
  const [actors, affiliations, references, licenceData] = await Promise.all([
    getSheetsDataFrom(config.acteursSpreadsheetId, ["ATHLETES", "COACHS", "MEDECINS", "OFFICIELS", "AUTRES"].map(name => `${name}!A:ZZ`)),
    getSheetsDataFrom(config.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS", "COACH_AFFILIATIONS", "MEDECIN_AFFILIATIONS", "OFFICIELS_AFFILIATIONS", "AUTRES_AFFILIATIONS", "MANDATS"].map(name => `${name}!A:Z`)),
    getSheetsDataFrom(config.referentielsSpreadsheetId, ["SEXES", "STATUTS_AFFILIATION", "TYPES_STRUCTURES", "TYPES_ACTEURS", "FONCTION_OFFICIEL", "TYPES_AUTRES_ACTEURS"].map(name => `${name}!A:H`)),
    licenceSources,
  ])
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
  const result = buildClubActorIndex({ actors, affiliations, references }, today, formatDateFromSheet, clubId)
  const groups = Object.values(result.byClub)
  if (!licenceData) {
    for (const group of groups) for (const actor of [...group.athletes, ...group.coachs]) actor.licenceUnavailable = true
    return result
  }
  const [licences, seasons] = licenceData
  const text = (value: unknown) => String(value ?? "").trim()
  const athleteIds = new Set(groups.flatMap(group => group.athletes.map(actor => actor.id)))
  const coachIds = new Set(groups.flatMap(group => group.coachs.map(actor => actor.id)))
  const seasonsById = new Map((seasons.SAISON || []).map(row => [text(row.id_saison), row]))
  const athletes = activeActorLicenceNumbers((licences.ATHLETE_LICENCES || [])
    .filter(row => athleteIds.has(text(row.id_athlete)))
    .map(row => mapAthleteLicence(row, seasonsById.get(text(row.id_saison ?? row.saison)))), today)
  const coaches = activeActorLicenceNumbers((licences.ACTEURS_LICENCES || [])
    .filter(row => text(row.id_type_acteur) === "TAC002" && coachIds.has(text(row.id_coach) || text(row.id_acteur)))
    .map(row => mapLicence(row, "coach")), today)
  for (const group of groups) {
    for (const actor of group.athletes) actor.numeroLicence = athletes.get(actor.id) || ""
    for (const actor of group.coachs) actor.numeroLicence = coaches.get(actor.id) || ""
  }
  return result
}
