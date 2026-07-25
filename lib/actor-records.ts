import "server-only"

import { getSheetDataFrom } from "@/lib/google-sheets"
import { env } from "@/lib/env"
import {
  mapAthleteAffiliation,
  mapAthleteLicence,
  mapCoachAffiliation,
  mapLicence,
  mapMedecinAffiliation,
  mapOfficielAffiliation,
} from "@/lib/mappers/actor-records"
import type {
  AthleteAffiliation,
  AthleteLicence,
  BaseActorLicence,
  CoachAffiliation,
  MedecinAffiliation,
  OfficielAffiliation,
} from "@/lib/types"

async function rows(sheet: string) {
  if (!env.googleSheets.affiliationsSpreadsheetId) return []
  return getSheetDataFrom(env.googleSheets.affiliationsSpreadsheetId, `${sheet}!A:Z`)
}

export const getAthleteAffiliations = async (): Promise<AthleteAffiliation[]> =>
  (await rows("ATHLETE_AFFILIATIONS")).map(mapAthleteAffiliation).filter((item) => item.actorId)
export const getCoachAffiliations = async (): Promise<CoachAffiliation[]> =>
  (await rows("COACH_AFFILIATIONS")).map(mapCoachAffiliation).filter((item) => item.actorId)
export const getMedecinAffiliations = async (): Promise<MedecinAffiliation[]> =>
  (await rows("MEDECIN_AFFILIATIONS")).map(mapMedecinAffiliation).filter((item) => item.actorId)
export const getOfficielAffiliations = async (): Promise<OfficielAffiliation[]> =>
  (await rows("OFFICIELS_AFFILIATIONS")).map(mapOfficielAffiliation).filter((item) => item.actorId)

export const getAthleteLicences = async (): Promise<AthleteLicence[]> =>
  (await rows("ATHLETE_LICENCE")).map(mapAthleteLicence).filter((item) => item.idLicence && item.actorId)

async function licences(sheet: string, kind: "coach" | "medecin" | "officiel" | "arbitre") {
  return (await rows(sheet)).map((row) => mapLicence(row, kind)).filter((item) => item.idLicence && item.actorId)
}
export const getCoachLicences = (): Promise<BaseActorLicence[]> => licences("COACH_LICENCES", "coach")
export const getMedecinLicences = (): Promise<BaseActorLicence[]> => licences("MEDECINS_LICENCES", "medecin")
export const getOfficielLicences = (): Promise<BaseActorLicence[]> => licences("OFFICIELS_LICENCES", "officiel")
export const getArbitreLicences = (): Promise<BaseActorLicence[]> => licences("ARBITRES_LICENCES", "arbitre")
