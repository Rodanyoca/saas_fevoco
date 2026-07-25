import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleResultat } from "@/lib/types"
import { calculateNationalTeamVolleyballResult } from "@/lib/equipe-nationale-calculations"

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
  const idResultat = str(row, "id_resultat_equipe_nationale")
  const idParticipation = str(row, "id_participation_equipe_nationale")
  const result: EquipeNationaleResultat = {
    idResultatEquipeNationale: idResultat,
    idParticipationEquipeNationale: idParticipation,
    idResultatEn: idResultat,
    idParticipationEn: idParticipation,
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    discipline: str(row, "discipline"),
    categorie: str(row, "categorie"),
    genre: str(row, "genre"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    saison: str(row, "saison"),
    dateMatch: str(row, "date_match"),
    phase: str(row, "phase"),
    poule: "",
    adversaire: str(row, "adversaire"),
    paysAdversaire: str(row, "pays_adversaire"),
    scoreGlobal: str(row, "score_global"),
    set1Rdc: num(row, "set_1_rdc"),
    set1Adv: num(row, "set_1_adversaire"),
    set1Adversaire: num(row, "set_1_adversaire"),
    set2Rdc: num(row, "set_2_rdc"),
    set2Adv: num(row, "set_2_adversaire"),
    set2Adversaire: num(row, "set_2_adversaire"),
    set3Rdc: num(row, "set_3_rdc"),
    set3Adv: num(row, "set_3_adversaire"),
    set3Adversaire: num(row, "set_3_adversaire"),
    set4Rdc: num(row, "set_4_rdc"),
    set4Adv: num(row, "set_4_adversaire"),
    set4Adversaire: num(row, "set_4_adversaire"),
    set5Rdc: num(row, "set_5_rdc"),
    set5Adv: num(row, "set_5_adversaire"),
    set5Adversaire: num(row, "set_5_adversaire"),
    setsGagnesRdc: num(row, "sets_gagnes_rdc") ?? 0,
    setsGagnesAdversaire: num(row, "sets_gagnes_adversaire") ?? 0,
    totalPointsRdc: num(row, "total_points_rdc") ?? 0,
    totalPointsAdversaire: num(row, "total_points_adversaire") ?? 0,
    totalPointRdc: num(row, "total_points_rdc"),
    totalPointAdv: num(row, "total_points_adversaire"),
    resultatMatch: str(row, "resultat_match"),
    statutMatch: str(row, "statut_match"),
    observation: str(row, "observation"),
  }
  return calculateNationalTeamVolleyballResult(result)
}
