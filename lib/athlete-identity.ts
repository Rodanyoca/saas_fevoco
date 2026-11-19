import { formatDateForSheet } from "./compact-date"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["ACTIF", "INACTIF"])

function normalizeStatus(value: unknown) {
  const status = text(value).toUpperCase()
  if (status === "ACTIVE") return "ACTIF"
  if (status === "INACTIVE") return "INACTIF"
  return status || "ACTIF"
}

type AthleteInput = {
  idNational: string; idFivb: string; nomComplet: string
  dateDeNaissance: string; lieuDeNaissance: string; idSexe: string
  nationalite: string; telephone: string; email: string; adresse: string
  observations: string; avatarDriveId: string; avatarDriveUrl: string; statut: string
}

export function normalizeInput(payload: Record<string, unknown>): AthleteInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), dateDeNaissance: text(payload.dateDeNaissance),
    lieuDeNaissance: text(payload.lieuDeNaissance), idSexe: text(payload.idSexe),
    nationalite: text(payload.nationalite), telephone: text(payload.telephone),
    email: text(payload.email), adresse: text(payload.adresse), observations: text(payload.observations),
    avatarDriveId: text(payload.avatarDriveId), avatarDriveUrl: text(payload.avatarDriveUrl),
    statut: normalizeStatus(payload.statut),
  }
}

export function validateAthleteIdentity(input: AthleteInput, sexes: Array<{ id: string; nom: string }>) {
  if (!input.nomComplet) throw new Error("Le nom complet est obligatoire.")
  if (!input.idSexe) throw new Error("Le sexe est obligatoire.")
  if (input.dateDeNaissance) formatDateForSheet(input.dateDeNaissance)
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const selectedSex = sexes.find((option) => option.id === input.idSexe)
  if (!selectedSex) throw new Error("Le sexe sélectionné est invalide.")
  return selectedSex
}

export function athleteIdentityRecord(input: AthleteInput, id: string): Record<string, string> {
  return {
    id_athlete: id, id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, date_de_naissance: formatDateForSheet(input.dateDeNaissance),
    lieu_de_naissance: input.lieuDeNaissance, id_sexe: input.idSexe,
    nationalite: input.nationalite, telephone: input.telephone, email: input.email,
    adresse: input.adresse, observations: input.observations, statut: input.statut,
    avatar_drive_id: input.avatarDriveId, avatar_drive_url: input.avatarDriveUrl,
  }
}

