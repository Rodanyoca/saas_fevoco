import type { CoachAffiliation } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function first(row: SheetRow, keys: string[]): string {
  for (const key of keys) {
    const value = str(row, key)
    if (value) return value
  }
  return ""
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

export function mapCoachAffiliationRow(row: SheetRow): CoachAffiliation {
  const coachId = first(row, ["id_coach", "coach_id"])
  const equipeId = first(row, ["id_club", "club_id", "id_equipe", "equipe_id"])
  const equipeNom = first(row, ["nom_club", "club", "club_nom", "nom_equipe", "equipe", "equipe_nom"])
  const dateDebut = first(row, ["date_de_debut", "date_debut", "debut"])
  const dateFin = first(row, ["date_de_fin", "date_fin", "fin"])
  const role = first(row, ["role", "fonction"])
  const statutRaw = first(row, ["statut", "staut"])

  return {
    id: first(row, ["id_affiliation", "id_coach_affiliation", "id"]) || `${coachId}-${equipeId}-${dateDebut}`,
    coachId,
    role,
    equipeId,
    equipeNom,
    dateDebut,
    dateFin,
    statut: normalizeStatut(statutRaw),
  }
}
