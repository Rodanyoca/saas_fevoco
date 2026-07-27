import "server-only"

import { env } from "@/lib/env"
import { getActorSexes } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { getArbitres } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type ArbitreInput = {
  idNational: string; idFivb: string; nomComplet: string; sexe: string
  dateDeNaissance: string; nationalite: string; niveau: string
  telephone: string; email: string; adresse: string
  dateAffiliation: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): ArbitreInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), sexe: text(payload.sexe),
    dateDeNaissance: text(payload.dateDeNaissance), nationalite: text(payload.nationalite),
    niveau: text(payload.niveau), telephone: text(payload.telephone),
    email: text(payload.email), adresse: text(payload.adresse),
    dateAffiliation: text(payload.dateAffiliation),
    statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: ArbitreInput) {
  if (!input.nomComplet) throw new Error("Le nom est obligatoire.")
  if (!input.sexe) throw new Error("Le sexe est obligatoire.")
  assertValidDate(input.dateDeNaissance, "La date de naissance")
  assertValidDate(input.dateAffiliation, "La date d’affiliation")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const sexes = await getActorSexes()
  if (sexes.length && !sexes.some((option) => option.nom === input.sexe)) throw new Error("Le sexe sélectionné est invalide.")
}

export async function createArbitre(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const arbitres = await getArbitres()
  const idArbitre = nextActorId(arbitres.map((item) => item.idArbitre), "ABR")
  if (arbitres.some((item) => item.idArbitre === idArbitre)) throw new Error("Cet identifiant d’arbitre existe déjà.")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "ARBITRES", {
    id_arbitre: idArbitre, id_national: input.idNational, id_fivb: input.idFivb,
    nom: input.nomComplet, sexe: input.sexe, date_de_naissance: input.dateDeNaissance,
    nationalite: input.nationalite, niveau: input.niveau, telephone: input.telephone,
    email: input.email, adresse: input.adresse, date_affiliation: input.dateAffiliation,
    statut: input.statut,
  })
  return (await getArbitres()).find((item) => item.idArbitre === idArbitre)
    ?? { idArbitre, ...input, avatarDriveId: "", avatarDriveUrl: "" }
}

export async function updateArbitre(idArbitre: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  await validateInput(input)
  const arbitres = await getArbitres()
  const current = arbitres.find((item) => item.idArbitre === idArbitre)
  if (!current) throw new Error("Arbitre introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ARBITRES", "id_arbitre", idArbitre, {
    id_national: input.idNational, id_fivb: input.idFivb, nom: input.nomComplet,
    sexe: input.sexe, date_de_naissance: input.dateDeNaissance,
    nationalite: input.nationalite, niveau: input.niveau, telephone: input.telephone,
    email: input.email, adresse: input.adresse, date_affiliation: input.dateAffiliation,
    statut: input.statut,
  })
  return (await getArbitres()).find((item) => item.idArbitre === idArbitre)
    ?? { idArbitre, ...input, avatarDriveId: current.avatarDriveId, avatarDriveUrl: current.avatarDriveUrl }
}

export async function updateArbitreAvatar(idArbitre: string, avatarDriveId: string, avatarDriveUrl: string) {
  const current = (await getArbitres()).find((item) => item.idArbitre === idArbitre)
  if (!current) throw new Error("Arbitre introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ARBITRES", "id_arbitre", idArbitre, {
    avatar_drive_id: avatarDriveId,
    avatar_drive_url: avatarDriveUrl,
  })
  return (await getArbitres()).find((item) => item.idArbitre === idArbitre)
    ?? { ...current, avatarDriveId, avatarDriveUrl }
}
