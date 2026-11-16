import "server-only"
import { env } from "@/lib/env"
import { getSheetDataFrom, getSheetsDataFrom } from "@/lib/google-sheets"
import { getActorSexes } from "@/lib/actor-references"
import { mapLigueRow } from "@/lib/mappers/ligues"
import { mapEntenteRow } from "@/lib/mappers/ententes"
import { mapClubRow } from "@/lib/mappers/clubs"
import { mapAthleteRow } from "@/lib/mappers/athletes"
import { mapCoachRow } from "@/lib/mappers/coachs"
import { mapArbitreRow } from "@/lib/mappers/arbitres"
import { mapMedecinRow } from "@/lib/mappers/medecins"
import { mapOfficielRow } from "@/lib/mappers/officiels"

// Reuse the existing domain mappers and validity filters. The dashboard does not
// display territorial parents, cities, coach levels, referee grades or specialties.
export async function loadDashboardDirectory() {
  const config = env.googleSheets
  const actorSheets = ["ATHLETES", "COACHS", "ARBITRES", "MEDECINS", "OFFICIELS"]
  const [territory, actors, sexes] = await Promise.all([
    getSheetsDataFrom(config.territorialSpreadsheetId, ["LIGUES!A:ZZ", "ENTENTES!A:ZZ", "CLUBS!A:ZZ"]).catch(() => ({ LIGUES: [], ENTENTES: [], CLUBS: [] })),
    Promise.all(actorSheets.map(async sheet => {
      // Independent failures, coalesced into batchGet by the existing Sheets layer.
      const rows = await getSheetDataFrom(config.acteursSpreadsheetId, `${sheet}!A:ZZ`).catch(() => [])
      return [sheet, rows] as const
    })).then(entries => Object.fromEntries(entries)),
    getActorSexes(),
  ])
  const names = new Map(sexes.map(item => [item.id, item.nom]))
  const withSex = (sheet: string) => (actors[sheet] || []).map(row => ({ ...row, nom_sexe: names.get(String(row.id_sexe ?? "").trim()) || "" }))
  const validStructure = <T extends { id: string; nom: string }>(rows: T[]) => rows.filter(row => row.id && row.nom)
  const validActor = <T extends { id: string; nomComplet: string }>(rows: T[]) => rows.filter(row => row.id && row.nomComplet)
  return {
    ligues: validStructure((territory.LIGUES || []).map(mapLigueRow)),
    ententes: validStructure((territory.ENTENTES || []).map(mapEntenteRow)),
    clubs: validStructure((territory.CLUBS || []).map(mapClubRow)),
    athletes: validActor(withSex("ATHLETES").map(mapAthleteRow)),
    coachs: validActor(withSex("COACHS").map(mapCoachRow)),
    arbitres: validActor(withSex("ARBITRES").map(mapArbitreRow)),
    medecins: validActor(withSex("MEDECINS").map(mapMedecinRow)),
    officiels: validActor(withSex("OFFICIELS").map(mapOfficielRow)),
  }
}
