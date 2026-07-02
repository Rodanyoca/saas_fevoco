import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleSelection } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

export function mapEquipeNationaleSelectionRow(row: SheetRow): EquipeNationaleSelection {
  return {
    idSelection: str(row, "id_selection"),
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    nomAthlete: str(row, "nom_athlete"),
    nomClub: str(row, "nom_club"),
    poste: str(row, "poste"),
    dateDebutSelection: str(row, "date_debut_selection"),
    dateFinSelection: str(row, "date_fin_selection"),
    statutSelection: str(row, "statut_selection"),
  }
}
