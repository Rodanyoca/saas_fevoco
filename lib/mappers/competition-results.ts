import type { SheetRow } from "@/lib/google-sheets"
import type { CompetitionResult } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function num(row: SheetRow, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined || value === "") return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function normalizeDiscipline(raw: string): string {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR") return "INDOOR"
  if (v === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionResultRow(row: SheetRow): CompetitionResult {
  return {
    idResultat: str(row, "id_resultat"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    dateMatch: str(row, "date_match"),
    phase: str(row, "phase"),
    poule: str(row, "poule"),
    idUniteA: str(row, "id_unite_a"),
    nomUniteA: str(row, "nom_unite_a"),
    idUniteB: str(row, "id_unite_b"),
    nomUniteB: str(row, "nom_unite_b"),
    scoreGlobal: str(row, "score_global"),
    set1A: num(row, "set1_a"),
    set1B: num(row, "set1_b"),
    set2A: num(row, "set2_a"),
    set2B: num(row, "set2_b"),
    set3A: num(row, "set3_a"),
    set3B: num(row, "set3_b"),
    set4A: num(row, "set4_a"),
    set4B: num(row, "set4_b"),
    set5A: num(row, "set5_a"),
    set5B: num(row, "set5_b"),
    totalPointA: num(row, "total_point_a"),
    totalPointB: num(row, "total_point_b"),
    pointsClassementA: num(row, "points_classement_a"),
    pointsClassementB: num(row, "points_classement_b"),
    idUniteVainqueur: str(row, "id_unite_vainquer") || str(row, "id_unite_vainqueur"),
    vainqueur: str(row, "vainqueur"),
    statutMatch: str(row, "statut_match"),
  }
}
