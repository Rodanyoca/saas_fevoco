import { reservedBusinessIds } from "@/lib/business-write-guard"
import "server-only"

import { env } from "@/lib/env"
import { getActorSexes } from "@/lib/actor-references"
import { getAthletes } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { nextActorId } from "@/lib/actor-id"

import { normalizeInput, validateAthleteIdentity, athleteIdentityRecord } from "@/lib/athlete-identity"

async function validateInput(input: ReturnType<typeof normalizeInput>) {
  return validateAthleteIdentity(input, await getActorSexes())
}

export async function createAthlete(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const selectedSex = await validateInput(input)
  const athletes = await getAthletes()
  const idAthlete = nextActorId([...athletes.map((athlete) => athlete.idAthlete), ...await reservedBusinessIds("ATHLETES")], "ATH")
  if (athletes.some((athlete) => athlete.idAthlete === idAthlete)) throw new Error("Cet identifiant d’athlète existe déjà.")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "ATHLETES", athleteIdentityRecord(input, idAthlete))
  return (await getAthletes()).find((athlete) => athlete.idAthlete === idAthlete)
    ?? { idAthlete, ...input, sexe: selectedSex.nom }
}

export async function updateAthlete(idAthlete: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const selectedSex = await validateInput(input)
  const athletes = await getAthletes()
  const current = athletes.find((athlete) => athlete.idAthlete === idAthlete)
  if (!current) throw new Error("Athlète introuvable.")
  input.avatarDriveId = current.avatarDriveId
  input.avatarDriveUrl = current.avatarDriveUrl
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ATHLETES", "id_athlete", idAthlete, {
    id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, date_de_naissance: input.dateDeNaissance,
    lieu_de_naissance: input.lieuDeNaissance, id_sexe: input.idSexe,
    nationalite: input.nationalite, telephone: input.telephone,
    email: input.email, adresse: input.adresse, observations: input.observations,
    avatar_drive_id: input.avatarDriveId, avatar_drive_url: input.avatarDriveUrl,
    statut: input.statut,
  })
  return (await getAthletes()).find((athlete) => athlete.idAthlete === idAthlete)
    ?? { idAthlete, ...input, sexe: selectedSex.nom }
}

export async function updateAthleteAvatar(idAthlete: string, avatarDriveId: string, avatarDriveUrl: string) {
  const athletes = await getAthletes()
  const current = athletes.find((athlete) => athlete.idAthlete === idAthlete)
  if (!current) throw new Error("Athlète introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ATHLETES", "id_athlete", idAthlete, {
    avatar_drive_id: avatarDriveId,
    avatar_drive_url: avatarDriveUrl,
  })
  return (await getAthletes()).find((athlete) => athlete.idAthlete === idAthlete)
    ?? { ...current, avatarDriveId, avatarDriveUrl }
}
