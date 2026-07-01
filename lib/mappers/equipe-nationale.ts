import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationale } from "@/lib/types"

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

export function mapEquipeNationaleRow(row: SheetRow): EquipeNationale {
  return {
    idSelection: str(row, "id_selection"),
    idAthlete: str(row, "id_athlete"),
    nomAthlete: first(row, ["nom_athlete", "nom_complet"]),
    genre: str(row, "genre"),
    discipline: first(row, ["discipline", "discipline_active"]),
    poste: first(row, ["poste", "poste_indoor", "poste_beach"]),
    idClub: str(row, "id_club"),
    nomClub: str(row, "nom_club"),
    entiteNationale: str(row, "entite_nationale"),
    statutSelection: first(row, ["statut_selection", "statut"]),
    saison: str(row, "saison"),
    observations: first(row, ["observations", "observation"]),
  }
}
