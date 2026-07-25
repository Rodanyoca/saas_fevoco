import "server-only"

import { env } from "@/lib/env"
import { getActorSexes } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { getCoachs } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type CoachInput = {
  idNational: string; idFivb: string; nomComplet: string; sexe: string
  dateNaissance: string; nationalite: string; niveau: string
  telephone: string; email: string; adresse: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): CoachInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), sexe: text(payload.sexe),
    dateNaissance: text(payload.dateNaissance), nationalite: text(payload.nationalite),
    niveau: text(payload.niveau), telephone: text(payload.telephone),
    email: text(payload.email), adresse: text(payload.adresse),
    statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: CoachInput) {
  if (!input.nomComplet) throw new Error("Le nom complet est obligatoire.")
  if (!input.sexe) throw new Error("Le sexe est obligatoire.")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const sexes = await getActorSexes()
  if (sexes.length && !sexes.some((option) => option.nom === input.sexe)) throw new Error("Le sexe sélectionné est invalide.")
}

export async function createCoach(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const coachs = await getCoachs()
  const idCoach = nextActorId(coachs.map((coach) => coach.idCoach), "TRN")
  if (coachs.some((coach) => coach.idCoach === idCoach)) throw new Error("Cet identifiant de coach existe déjà.")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "COACHS", {
    id_coach: idCoach, id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, sexe: input.sexe,
    date_naissance: input.dateNaissance, nationalite: input.nationalite,
    niveau: input.niveau, telephone: input.telephone, email: input.email,
    adresse: input.adresse, statut: input.statut,
  })
  return { idCoach, ...input }
}

export async function updateCoach(idCoach: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const coachs = await getCoachs()
  const current = coachs.find((coach) => coach.idCoach === idCoach)
  if (!current) throw new Error("Coach introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "COACHS", "id_coach", idCoach, {
    id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, sexe: input.sexe,
    date_naissance: input.dateNaissance, nationalite: input.nationalite,
    niveau: input.niveau, telephone: input.telephone, email: input.email,
    adresse: input.adresse, statut: input.statut,
  })
  return { idCoach, ...input, avatarDriveId: current.avatarDriveId, avatarDriveUrl: current.avatarDriveUrl }
}
