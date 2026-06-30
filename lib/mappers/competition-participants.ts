import type { SheetRow } from "@/lib/google-sheets"
import type { CompetitionParticipant } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeDiscipline(raw: string): string {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR") return "INDOOR"
  if (v === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionParticipantRow(row: SheetRow): CompetitionParticipant {
  return {
    idParticipation: str(row, "id_participation"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    typeParticipant: str(row, "type_participant"),
    idClub: str(row, "id_club"),
    nomClub: str(row, "nom_club"),
    poule: str(row, "poule"),
    idAthlete: str(row, "id_athlete"),
    nomAthlete: str(row, "nom_athlete"),
    statutParticipation: str(row, "statut_participation"),
    exportCoc: str(row, "export_coc"),
  }
}
