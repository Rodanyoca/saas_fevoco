import { getSheetData } from "@/lib/google-sheets"
import type { Arbitre, Athlete, Club, Coach, Entente, Ligue, Medecin, Officiel, Province } from "@/lib/types"
import { mapProvinceRow } from "@/lib/mappers/provinces"
import { mapLigueRow } from "@/lib/mappers/ligues"
import { mapEntenteRow } from "@/lib/mappers/ententes"
import { mapClubRow } from "@/lib/mappers/clubs"
import { mapAthleteRow } from "@/lib/mappers/athletes"
import { mapCoachRow } from "@/lib/mappers/coachs"
import { mapOfficielRow } from "@/lib/mappers/officiels"
import { mapMedecinRow } from "@/lib/mappers/medecins"
import { mapArbitreRow } from "@/lib/mappers/arbitres"

function computeProvinceCompletude(p: Province): number {
  const fields: Array<string> = [p.id, p.nom, p.chefLieu, p.responsable, p.telephone, p.email, String(p.statut)]
  const filled = fields.filter((v) => String(v).trim().length > 0).length
  return Math.round((filled / fields.length) * 100)
}

export async function getProvinces(): Promise<Province[]> {
  const rows = await getSheetData("PROVINCES")
  const base = rows.map(mapProvinceRow).filter((p) => p.id && p.nom)

  const [ligues, ententes, clubs, athletes, coachs, arbitres, medecins] = await Promise.all([
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
    getCoachs(),
    getArbitres(),
    getMedecins(),
  ])

  return base
    .map((p) => {
      const provinceLigues = ligues.filter((l) => l.provinceId === p.id || l.provinceNom === p.nom)
      const provinceEntentes = ententes.filter((e) => e.provinceId === p.id || e.provinceNom === p.nom)
      const provinceClubs = clubs.filter((c) => c.provinceId === p.id || c.provinceNom === p.nom)
      const provinceAthletes = athletes.filter((a) => a.provinceId === p.id || a.provinceNom === p.nom)
      const provinceCoachs = coachs.filter((c) => c.provinceId === p.id || c.provinceNom === p.nom)
      const provinceArbitres = arbitres.filter((a) => a.provinceId === p.id || a.provinceNom === p.nom)
      const provinceMedecins = medecins.filter((m) => m.provinceId === p.id || m.provinceNom === p.nom)

      const withCounts: Province = {
        ...p,
        ligues: provinceLigues.length,
        ententes: provinceEntentes.length,
        clubs: provinceClubs.length,
        athletes: provinceAthletes.length,
        coachs: provinceCoachs.length,
        arbitres: provinceArbitres.length,
        medecins: provinceMedecins.length,
        completude: computeProvinceCompletude(p),
      }

      return withCounts
    })
    .sort((a, b) => a.nom.localeCompare(b.nom))
}

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

export async function getCoachs(): Promise<Coach[]> {
  const rows = await getSheetData("COACHS")
  return rows.map(mapCoachRow).filter((c) => c.id && c.nomComplet)
}

export async function getOfficiels(): Promise<Officiel[]> {
  const rows = await getSheetData("OFFICIELS")
  return rows.map(mapOfficielRow).filter((o) => o.id && o.nomComplet)
}

export async function getMedecins(): Promise<Medecin[]> {
  const rows = await getSheetData("MEDECINS")
  return rows.map(mapMedecinRow).filter((m) => m.id && m.nomComplet)
}

export async function getArbitres(): Promise<Arbitre[]> {
  const rows = await getSheetData("ARBITRES")
  return rows.map(mapArbitreRow).filter((a) => a.id && a.nomComplet)
}
