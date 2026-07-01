import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleSuivi } from "@/lib/types"

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

export function mapEquipeNationaleSuiviRow(row: SheetRow): EquipeNationaleSuivi {
  return {
    idSuivi: str(row, "id_suivi"),
    idSelection: str(row, "id_selection"),
    idResultat: str(row, "id_resultat"),
    idAthlete: str(row, "id_athlete"),
    nomAthlete: first(row, ["nom_athlete", "nom_complet"]),
    entiteNationale: str(row, "entite_nationale"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    niveauCompetition: str(row, "niveau_competition"),
    dateMatch: str(row, "date_match"),
    adversaire: str(row, "adversaire"),
    scoreGlobal: str(row, "score_global"),
    resultatMatch: str(row, "resultat_match"),
    pointsSuivi: num(row, "points_suivi"),
  }
}
