import "server-only"

import { getSheetDataFrom } from "@/lib/google-sheets"
import { env } from "@/lib/env"
import {
  mapAthleteLicence,
  mapLicence,
} from "@/lib/mappers/actor-records"
import type {
  AthleteAffiliation,
  AthleteLicence,
  BaseActorLicence,
  CoachAffiliation,
  MedecinAffiliation,
  OfficielAffiliation,
} from "@/lib/types"
import { isMissingSheetRangeError } from "@/lib/optional-sheet"
import { allActorAffiliationViews } from "@/lib/actor-affiliations"
import type { ActorAffiliationView } from "@/lib/actor-affiliation-schema"
import { athleteAffiliationClubId } from "@/lib/athlete-affiliation-fields"

const baseAffiliation = (row: ActorAffiliationView) => ({ idAffiliation: row.id, actorId: row.actorId, actorName: row.actorName || "", idStructure: row.clubId || row.entityId, nomStructure: row.structure, dateDebut: row.dateDebut, dateFin: row.dateFin, statutAffiliation: row.statut, observation: row.observations })

async function licenceRows(sheet: string) {
  if (!env.googleSheets.licencesSpreadsheetId) return []
  return getSheetDataFrom(env.googleSheets.licencesSpreadsheetId, `${sheet}!A:Z`)
}

export const getAthleteAffiliations = async (): Promise<AthleteAffiliation[]> =>
  (await allActorAffiliationViews("athlete")).map(row => ({ ...baseAffiliation(row), saison: "", typeAffiliation: "CLUB", idClubOrigine: "", nomClubOrigine: "", idClubBeneficiaire: row.clubId, nomClubBeneficiaire: row.structure }))
export const getCoachAffiliations = async (): Promise<CoachAffiliation[]> =>
  (await allActorAffiliationViews("coach")).map(row => ({ ...baseAffiliation(row), saison: "", typeAffiliation: "CLUB", fonction: "" }))
export const getMedecinAffiliations = async (): Promise<MedecinAffiliation[]> =>
  (await allActorAffiliationViews("medecin")).map(row => ({ ...baseAffiliation(row), saison: "", typeAffiliation: "CLUB", fonction: "" }))
export const getOfficielAffiliations = async (): Promise<OfficielAffiliation[]> => {
  return (await allActorAffiliationViews("officiel")).map(row => ({ ...baseAffiliation(row), idTypeActeur: "", idFonction: row.functionId, idTypeStructure: row.entityTypeId, idSaison: "", typeStructure: row.entityType, saison: "", fonction: row.fonction }))
}

async function optionalLicenceRows(sheet: string) {
  try { return await licenceRows(sheet) } catch (error) {
    if (isMissingSheetRangeError(error, sheet)) {
      console.warn(`Onglet facultatif ${sheet} absent : les licences seront affichées comme non renseignées.`)
      return []
    }
    throw error
  }
}

export const getAthleteLicences = async (): Promise<AthleteLicence[]> => {
  const [rows, seasons, affiliations, clubs] = await Promise.all([
    optionalLicenceRows("ATHLETE_LICENCES"),
    getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "SAISON!A:ZZ"),
    getSheetDataFrom(env.googleSheets.affiliationsSpreadsheetId, "ATHLETE_AFFILIATIONS!A:ZZ"),
    getSheetDataFrom(env.googleSheets.territorialSpreadsheetId, "CLUBS!A:ZZ"),
  ])
  const text = (value: unknown) => String(value ?? "").trim()
  const seasonsById = new Map(seasons.map(row => [String(row.id_saison ?? "").trim(), row]))
  const affiliationsById = new Map(affiliations.map(row => [text(row.id_affiliation_athlete ?? row.id_affiliation), row]))
  const clubsById = new Map(clubs.map(row => [text(row.id_club), text(row.nom_club)]))
  return rows.map(row => {
    const licence = mapAthleteLicence(row, seasonsById.get(text(row.id_saison ?? row.saison)))
    const affiliation = affiliationsById.get(licence.idAffiliation)
    // Conserver la structure de l'affiliation utilisée à la délivrance, même historique.
    if (!affiliation || text(affiliation.id_athlete ?? affiliation.athlete_id ?? affiliation.id_acteur) !== licence.actorId) return licence
    const idClub = athleteAffiliationClubId(affiliation)
    return { ...licence, idClub, nomClub: clubsById.get(idClub) || "" }
  })
    .filter(item => item.idLicence && item.actorId)
}

const actorTypeIds = { coach: "TAC002", officiel: "TAC003", arbitre: "TAC004", medecin: "TAC005" } as const
async function licences(kind: keyof typeof actorTypeIds) {
  const [rows, statuses] = await Promise.all([
    optionalLicenceRows("ACTEURS_LICENCES"),
    getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "STATUT_LICENCE!A:ZZ"),
  ])
  const labels = new Map(statuses.map(row => [String(row.id_statut_licence ?? "").trim(), String(row.nom_statut_licence ?? "").trim()]))
  return rows
    .filter((row) => String(row.id_type_acteur ?? "").trim() === actorTypeIds[kind])
    .map((row) => {
      const licence = mapLicence(row, kind)
      return { ...licence, statutLicence: labels.get(licence.idStatutLicence || "") || licence.statutLicence }
    }).filter((item) => item.idLicence && item.actorId)
}
export const getCoachLicences = (): Promise<BaseActorLicence[]> => licences("coach")
export const getMedecinLicences = (): Promise<BaseActorLicence[]> => licences("medecin")
export const getOfficielLicences = (): Promise<BaseActorLicence[]> => licences("officiel")
export const getArbitreLicences = (): Promise<BaseActorLicence[]> => licences("arbitre")
