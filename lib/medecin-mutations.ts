import "server-only"

import { env } from "@/lib/env"
import { getActorSexes, getMedecinSpecialties } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { getMedecins } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type MedecinInput = {
  idNational: string; idFivb: string; nomComplet: string; sexe: string
  dateDeNaissance: string; nationalite: string; telephone: string
  email: string; adresse: string; specialite: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): MedecinInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), sexe: text(payload.sexe),
    dateDeNaissance: text(payload.dateDeNaissance), nationalite: text(payload.nationalite),
    telephone: text(payload.telephone), email: text(payload.email),
    adresse: text(payload.adresse), specialite: text(payload.specialite),
    statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: MedecinInput) {
  if (!input.nomComplet) throw new Error("Le nom est obligatoire.")
  if (!input.sexe) throw new Error("Le sexe est obligatoire.")
  assertValidDate(input.dateDeNaissance, "La date de naissance")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const sexes = await getActorSexes()
  if (sexes.length && !sexes.some((option) => option.nom === input.sexe)) throw new Error("Le sexe sélectionné est invalide.")
  const specialties = await getMedecinSpecialties()
  if (input.specialite && specialties.length && !specialties.some((option) => option.nom === input.specialite)) {
    throw new Error("La spécialité sélectionnée est invalide.")
  }
}

export async function createMedecin(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const medecins = await getMedecins()
  const idMedecin = nextActorId(medecins.map((item) => item.idMedecin), "MED")
  if (medecins.some((item) => item.idMedecin === idMedecin)) throw new Error("Cet identifiant de médecin existe déjà.")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "MEDECINS", {
    id_medecin: idMedecin, id_national: input.idNational, id_fivb: input.idFivb,
    nom: input.nomComplet, sexe: input.sexe, date_de_naissance: input.dateDeNaissance,
    nationalite: input.nationalite, telephone: input.telephone, email: input.email,
    adresse: input.adresse, specialite: input.specialite, statut: input.statut,
  })
  return (await getMedecins()).find((item) => item.idMedecin === idMedecin)
    ?? { idMedecin, ...input, avatarDriveId: "", avatarDriveUrl: "" }
}

export async function updateMedecin(idMedecin: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const medecins = await getMedecins()
  const current = medecins.find((item) => item.idMedecin === idMedecin)
  if (!current) throw new Error("Médecin introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "id_medecin", idMedecin, {
    id_national: input.idNational, id_fivb: input.idFivb,
    nom: input.nomComplet, sexe: input.sexe, date_de_naissance: input.dateDeNaissance,
    nationalite: input.nationalite, telephone: input.telephone, email: input.email,
    adresse: input.adresse, specialite: input.specialite, statut: input.statut,
  })
  return (await getMedecins()).find((item) => item.idMedecin === idMedecin)
    ?? { idMedecin, ...input, avatarDriveId: current.avatarDriveId, avatarDriveUrl: current.avatarDriveUrl }
}

export async function updateMedecinAvatar(idMedecin: string, avatarDriveId: string, avatarDriveUrl: string) {
  const current = (await getMedecins()).find((item) => item.idMedecin === idMedecin)
  if (!current) throw new Error("Médecin introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "id_medecin", idMedecin, {
    avatar_drive_id: avatarDriveId,
    avatar_drive_url: avatarDriveUrl,
  })
  return (await getMedecins()).find((item) => item.idMedecin === idMedecin)
    ?? { ...current, avatarDriveId, avatarDriveUrl }
}
