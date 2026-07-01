import type { SheetRow } from "@/lib/google-sheets"
import type { CompetitionClassement } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

function first(row: SheetRow, keys: string[]): string {
  for (const key of keys) {
    const value = str(row, key)
    if (value) return value
  }
  return ""
}

function num(row: SheetRow, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined || value === "") return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function normalizeDiscipline(raw: string): string {
  const value = raw.trim().toUpperCase()
  if (value === "INDOOR") return "INDOOR"
  if (value === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionClassementRow(row: SheetRow): CompetitionClassement {
  return {
    idClassement: str(row, "id_classement"),
    idResultat: str(row, "id_resultat"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    phase: str(row, "phase"),
    poule: str(row, "poule"),
    idUnite: str(row, "id_unite"),
    nomUnite: str(row, "nom_unite"),
    typeUnite: str(row, "type_unite"),
    adversaire: str(row, "adversaire"),
    scoreGlobal: str(row, "score_global"),
    resultatMatch: str(row, "resultat_match"),
    setsGagnes: num(row, "sets_gagnes"),
    setsPerdus: num(row, "sets_perdus"),
    pointsGagnes: num(row, "points_gagnes"),
    pointsPerdus: num(row, "points_perdus"),
    differenceSets: num(row, "difference_sets"),
    differencePoints: num(row, "difference_points"),
    pointsClassement: num(row, "points_classement"),
    rang: num(row, "rang"),
  }
}
