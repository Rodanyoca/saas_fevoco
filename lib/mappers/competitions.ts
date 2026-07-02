import type { SheetRow } from "@/lib/google-sheets"
import type { Competition } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

function normalizeDiscipline(raw: string): string {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR") return "INDOOR"
  if (v === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionRow(row: SheetRow): Competition {
  return {
    id: str(row, "id_competition") || str(row, "id"),
    nomCompetition: str(row, "nom_competition"),
    saison: str(row, "saison"),
    dateDebut: str(row, "date_debut"),
    dateFin: str(row, "date_fin"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    lieu: str(row, "lieu"),
    niveau: str(row, "niveau"),
    statut: normalizeStatut(str(row, "statut")),
    observation: str(row, "observation"),
    suiviCno: str(row, "suivi_cno"),
  }
}
