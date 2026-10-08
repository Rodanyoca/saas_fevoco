import "server-only"
import { env } from "@/lib/env"
import { getSheetsDataFrom } from "@/lib/google-sheets"
import { formatDateFromSheet } from "@/lib/compact-date"
import { buildClubActorIndex, type ClubActorsBundle } from "@/lib/club-actors-model"

export async function loadClubActors(): Promise<ClubActorsBundle> {
  const config = env.googleSheets
  if (!config.acteursSpreadsheetId || !config.affiliationsSpreadsheetId || !config.referentielsSpreadsheetId || !config.clientEmail || !config.privateKey) throw new Error("Les sources des acteurs et affiliations ne sont pas configurées.")
  const [actors, affiliations, references] = await Promise.all([
    getSheetsDataFrom(config.acteursSpreadsheetId, ["ATHLETES", "COACHS", "MEDECINS", "OFFICIELS", "AUTRES"].map(name => `${name}!A:ZZ`)),
    getSheetsDataFrom(config.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS", "COACH_AFFILIATIONS", "MEDECIN_AFFILIATIONS", "OFFICIELS_AFFILIATIONS", "AUTRES_AFFILIATIONS", "MANDATS"].map(name => `${name}!A:Z`)),
    getSheetsDataFrom(config.referentielsSpreadsheetId, ["SEXES", "STATUTS_AFFILIATION", "TYPES_STRUCTURES", "TYPES_ACTEURS", "FONCTION_OFFICIEL", "TYPES_AUTRES_ACTEURS"].map(name => `${name}!A:H`)),
  ])
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
  return buildClubActorIndex({ actors, affiliations, references }, today, formatDateFromSheet)
}
