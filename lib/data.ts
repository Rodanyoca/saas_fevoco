import { getSheetData } from "@/lib/google-sheets"
import type { Arbitre, Athlete, Club, Coach, CoachAffiliation, Competition, CompetitionClassement, CompetitionParticipant, CompetitionResult, CompetitionUnite, Entente, EquipeNationale, EquipeNationaleCompetition, EquipeNationaleResultat, EquipeNationaleSelection, Ligue, Medecin, Officiel, Province, Transfert } from "@/lib/types"
import { mapProvinceRow } from "@/lib/mappers/provinces"
import { mapLigueRow } from "@/lib/mappers/ligues"
import { mapEntenteRow } from "@/lib/mappers/ententes"
import { mapClubRow } from "@/lib/mappers/clubs"
import { mapAthleteRow } from "@/lib/mappers/athletes"
import { mapCoachRow } from "@/lib/mappers/coachs"
import { mapCoachAffiliationRow } from "@/lib/mappers/coach-affiliations"
import { mapOfficielRow } from "@/lib/mappers/officiels"
import { mapMedecinRow } from "@/lib/mappers/medecins"
import { mapArbitreRow } from "@/lib/mappers/arbitres"
import { mapCompetitionRow } from "@/lib/mappers/competitions"
import { mapCompetitionParticipantRow } from "@/lib/mappers/competition-participants"
import { mapCompetitionUniteRow } from "@/lib/mappers/competition-unites"
import { mapCompetitionResultRow } from "@/lib/mappers/competition-results"
import { mapCompetitionClassementRow } from "@/lib/mappers/competition-classements"
import { mapTransfertRow } from "@/lib/mappers/transferts"
import { mapEquipeNationaleRow } from "@/lib/mappers/equipe-nationale"
import { mapEquipeNationaleSelectionRow } from "@/lib/mappers/equipe-nationale-selections"
import { mapEquipeNationaleCompetitionRow } from "@/lib/mappers/equipe-nationale-competitions"
import { mapEquipeNationaleResultatRow } from "@/lib/mappers/equipe-nationale-resultats"

function computeProvinceCompletude(p: Province): number {
  const fields: Array<string> = [p.id, p.nom, p.chefLieu, p.responsable, p.telephone, p.email, String(p.statut)]
  const filled = fields.filter((v) => String(v).trim().length > 0).length
  return Math.round((filled / fields.length) * 100)
}

export async function getProvinces(): Promise<Province[]> {
  const rows = await getSheetData("PROVINCES")
  const base = rows.map(mapProvinceRow).filter((p) => p.id && p.nom)

  const [ligues, ententes, clubs, athletes, arbitres, medecins] = await Promise.all([
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
    getArbitres(),
    getMedecins(),
  ])

  return base
    .map((p) => {
      const provinceLigues = ligues.filter((l) => l.provinceId === p.id || l.provinceNom === p.nom)
      const provinceEntentes = ententes.filter((e) => e.provinceId === p.id || e.provinceNom === p.nom)
      const provinceClubs = clubs.filter((c) => c.provinceId === p.id || c.provinceNom === p.nom)
      const provinceAthletes = athletes.filter((a) => a.provinceId === p.id || a.provinceNom === p.nom)
      const provinceArbitres = arbitres.filter((a) => a.provinceId === p.id || a.provinceNom === p.nom)
      const provinceMedecins = medecins.filter((m) => m.provinceId === p.id || m.provinceNom === p.nom)

      const withCounts: Province = {
        ...p,
        ligues: provinceLigues.length,
        ententes: provinceEntentes.length,
        clubs: provinceClubs.length,
        athletes: provinceAthletes.length,
        coachs: 0,
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

export async function getCoachAffiliations(): Promise<CoachAffiliation[]> {
  let rows = await getSheetData("COAG_AFFILIATION")
  if (rows.length === 0) {
    rows = await getSheetData("COACH_AFFILIATION")
  }

  return rows.map(mapCoachAffiliationRow).filter((affiliation) => affiliation.coachId)
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

export async function getCompetitions(): Promise<Competition[]> {
  const rows = await getSheetData("COMPETITIONS")
  return rows.map(mapCompetitionRow).filter((competition) => competition.id && competition.nomCompetition)
}

export async function getCompetitionParticipants(): Promise<CompetitionParticipant[]> {
  const rows = await getSheetData("COMPETITIONS_PARTICIPANTS")
  return rows
    .map(mapCompetitionParticipantRow)
    .filter((participant) => participant.idParticipation && participant.idCompetition)
}

export async function getCompetitionUnites(): Promise<CompetitionUnite[]> {
  const rows = await getSheetData("COMPETITIONS_UNITES")
  return rows
    .map(mapCompetitionUniteRow)
    .filter((unite) => unite.idUnite && unite.idCompetition)
}

export async function getCompetitionResults(): Promise<CompetitionResult[]> {
  const rows = await getSheetData("COMPETITIONS_RESULTATS")
  return rows
    .map(mapCompetitionResultRow)
    .filter((result) => result.idResultat && result.idCompetition)
}

export async function getCompetitionClassements(): Promise<CompetitionClassement[]> {
  const rows = await getSheetData("COMPETITIONS_CLASSEMENT")
  return rows
    .map(mapCompetitionClassementRow)
    .filter((classement) => classement.idClassement && classement.idCompetition && classement.idUnite)
}

export async function getTransferts(): Promise<Transfert[]> {
  let rows = await getSheetData("TRANSGERT")
  if (rows.length === 0) rows = await getSheetData("TRANSGERTS")
  if (rows.length === 0) rows = await getSheetData("TRANSFERTS")
  if (rows.length === 0) rows = await getSheetData("TRANSFERT")

  return rows
    .map(mapTransfertRow)
    .filter((transfert) =>
      Boolean(
        transfert.id ||
          transfert.athleteId ||
          transfert.athleteNom ||
          transfert.clubOrigineNom ||
          transfert.clubBeneficiaireNom,
      ),
    )
}

export async function getEquipeNationale(): Promise<EquipeNationale[]> {
  const rows = await getSheetData("EQUIPE_NATIONALE")
  return rows
    .map(mapEquipeNationaleRow)
    .filter((equipe) => equipe.idEquipeNationale && equipe.nomEquipeNationale)
}

export async function getEquipeNationaleSelections(): Promise<EquipeNationaleSelection[]> {
  const rows = await getSheetData("EQUIPE_NATIONALE_SELECTIONS")
  return rows
    .map(mapEquipeNationaleSelectionRow)
    .filter((selection) => selection.idSelection && selection.idEquipeNationale && selection.idAthlete)
}

export async function getEquipeNationaleCompetitions(): Promise<EquipeNationaleCompetition[]> {
  const rows = await getSheetData("EQUIPE_NATIONALE_COMPETITIONS")
  return rows
    .map(mapEquipeNationaleCompetitionRow)
    .filter((participation) => participation.idParticipationEn && participation.idEquipeNationale)
}

export async function getEquipeNationaleResultats(): Promise<EquipeNationaleResultat[]> {
  const rows = await getSheetData("EQUIPE_NATIONALE_RESULTATS")
  return rows
    .map(mapEquipeNationaleResultatRow)
    .filter((resultat) => resultat.idResultatEn && resultat.idEquipeNationale)
}
