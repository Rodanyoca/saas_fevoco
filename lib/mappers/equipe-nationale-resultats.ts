import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleResultat } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

function num(row: SheetRow, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function mapEquipeNationaleResultatRow(row: SheetRow): EquipeNationaleResultat {
  return {
    idResultatEn: str(row, "id_resultat_en"),
    idParticipationEn: str(row, "id_participation_en"),
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    discipline: str(row, "discipline"),
    categorie: str(row, "categorie"),
    genre: str(row, "genre"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    dateMatch: str(row, "date_match"),
    phase: str(row, "phase"),
    poule: str(row, "poule"),
    adversaire: str(row, "adversaire"),
    paysAdversaire: str(row, "pays_adversaire"),
    scoreGlobal: str(row, "score_global"),
    set1Rdc: num(row, "set1_rdc"),
    set1Adv: num(row, "set1_adv"),
    set2Rdc: num(row, "set2_rdc"),
    set2Adv: num(row, "set2_adv"),
    set3Rdc: num(row, "set3_rdc"),
    set3Adv: num(row, "set3_adv"),
    set4Rdc: num(row, "set4_rdc"),
    set4Adv: num(row, "set4_adv"),
    set5Rdc: num(row, "set5_rdc"),
    set5Adv: num(row, "set5_adv"),
    totalPointRdc: num(row, "total_point_rdc"),
    totalPointAdv: num(row, "total_point_adv"),
    resultatMatch: str(row, "resultat_match"),
    statutMatch: str(row, "statut_match"),
    observation: str(row, "observation"),
  }
}
