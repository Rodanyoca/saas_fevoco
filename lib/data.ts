import { getSheetData } from "@/lib/google-sheets"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"
import { mapLigueRow } from "@/lib/mappers/ligues"
import { mapEntenteRow } from "@/lib/mappers/ententes"
import { mapClubRow } from "@/lib/mappers/clubs"
import { mapAthleteRow } from "@/lib/mappers/athletes"

export async function getLigues(): Promise<Ligue[]> {
  const rows = await getSheetData("LIGUES")
  return rows.map(mapLigueRow).filter((l) => l.id && l.nom)
}

export async function getEntentes(): Promise<Entente[]> {
  const rows = await getSheetData("ENTENTES")
  return rows.map(mapEntenteRow).filter((e) => e.id && e.nom)
}

export async function getClubs(): Promise<Club[]> {
  const rows = await getSheetData("CLUBS")
  return rows.map(mapClubRow).filter((c) => c.id && c.nom)
}

export async function getAthletes(): Promise<Athlete[]> {
  const rows = await getSheetData("ATHLETES")
  return rows.map(mapAthleteRow).filter((a) => a.id && a.nomComplet)
}
