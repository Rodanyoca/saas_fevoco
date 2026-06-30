import type { Coach } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

export function mapCoachRow(row: SheetRow): Coach {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_coach"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_de_naissance"),
    lieuNaissance: str(row, "lieu_de_naissance"),
    genre: str(row, "genre"),
    nationalite: str(row, "nationalite"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    niveau: str(row, "niveau"),
    specialisation: str(row, "specialisation"),
    dateAffiliation: str(row, "date_affiliation"),
    statut: normalizeStatut(statutRaw),
  }
}
