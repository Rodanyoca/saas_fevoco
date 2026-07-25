import "server-only"

import { env } from "@/lib/env"
import { getActorSexes } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { getOfficiels } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type OfficielInput = {
  idNational: string; idFivb: string; nomComplet: string; sexe: string
  dateDeNaissance: string; nationalite: string; telephone: string
  email: string; adresse: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): OfficielInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), sexe: text(payload.sexe),
    dateDeNaissance: text(payload.dateDeNaissance), nationalite: text(payload.nationalite),
    telephone: text(payload.telephone), email: text(payload.email),
    adresse: text(payload.adresse), statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: OfficielInput) {
  if (!input.nomComplet) throw new Error("Le nom complet est obligatoire.")
  if (!input.sexe) throw new Error("Le sexe est obligatoire.")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const sexes = await getActorSexes()
  if (sexes.length && !sexes.some((option) => option.nom === input.sexe)) throw new Error("Le sexe sélectionné est invalide.")
}

export async function createOfficiel(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const officiels = await getOfficiels()
  const idOfficiel = nextActorId(officiels.map((item) => item.idOfficiel), "OFF")
  if (officiels.some((item) => item.idOfficiel === idOfficiel)) throw new Error("Cet identifiant d’officiel existe déjà.")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "OFFICIELS", {
    id_officiel: idOfficiel, id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, sexe: input.sexe, date_de_naissance: input.dateDeNaissance,
    nationalite: input.nationalite, telephone: input.telephone, email: input.email,
    adresse: input.adresse, statut: input.statut,
  })
  return { idOfficiel, ...input, avatarDriveId: "", avatarDriveUrl: "" }
}

export async function updateOfficiel(idOfficiel: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const officiels = await getOfficiels()
  const current = officiels.find((item) => item.idOfficiel === idOfficiel)
  if (!current) throw new Error("Officiel introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "OFFICIELS", "id_officiel", idOfficiel, {
    id_national: input.idNational, id_fivb: input.idFivb, nom_complet: input.nomComplet,
    sexe: input.sexe, date_de_naissance: input.dateDeNaissance,
    nationalite: input.nationalite, telephone: input.telephone,
    email: input.email, adresse: input.adresse, statut: input.statut,
  })
  return { idOfficiel, ...input, avatarDriveId: current.avatarDriveId, avatarDriveUrl: current.avatarDriveUrl }
}
