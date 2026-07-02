import type {
  Arbitre,
  Athlete,
  Club,
  Coach,
  Competition,
  CompetitionClassement,
  CompetitionParticipant,
  CompetitionResult,
  CompetitionUnite,
  Entente,
  EquipeNationale,
  EquipeNationaleCompetition,
  EquipeNationaleResultat,
  EquipeNationaleSelection,
  Ligue,
  Medecin,
  Officiel,
  Province,
  Transfert,
} from "@/lib/types"

export interface QualityStat {
  entite: string
  total: number
  complets: number
  incomplets: number
  tauxCompletude: number
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim().length > 0
  return true
}

function buildQualityStat<T extends object>(
  entite: string,
  items: T[],
  requiredFields: Array<keyof T>,
): QualityStat {
  const total = items.length
  const complets = items.filter((item) => requiredFields.every((field) => isFilled(item[field]))).length
  const incomplets = total - complets
  const tauxCompletude = total ? Math.round((complets / total) * 100) : 0

  return {
    entite,
    total,
    complets,
    incomplets,
    tauxCompletude,
  }
}

export function getGlobalQualityRate(stats: QualityStat[]): number {
  const total = stats.reduce((acc, stat) => acc + stat.total, 0)
  const complets = stats.reduce((acc, stat) => acc + stat.complets, 0)
  return total ? Math.round((complets / total) * 100) : 0
}

export function createQualityStats(data: {
  provinces: Province[]
  ligues: Ligue[]
  ententes: Entente[]
  clubs: Club[]
  athletes: Athlete[]
  coachs: Coach[]
  arbitres: Arbitre[]
  medecins: Medecin[]
  officiels: Officiel[]
  competitions?: Competition[]
  competitionParticipants?: CompetitionParticipant[]
  competitionUnites?: CompetitionUnite[]
  competitionResults?: CompetitionResult[]
  competitionClassements?: CompetitionClassement[]
  transferts?: Transfert[]
  equipeNationale?: EquipeNationale[]
  equipeNationaleSelections?: EquipeNationaleSelection[]
  equipeNationaleCompetitions?: EquipeNationaleCompetition[]
  equipeNationaleResultats?: EquipeNationaleResultat[]
}): QualityStat[] {
  return [
    buildQualityStat("Provinces", data.provinces, ["id", "nom", "chefLieu", "responsable", "telephone", "email", "statut"]),
    buildQualityStat("Ligues", data.ligues, [
      "id",
      "nom",
      "provinceId",
      "provinceNom",
      "emailLigue",
      "presidentNom",
      "secretaireNom",
      "statut",
    ]),
    buildQualityStat("Ententes", data.ententes, ["id", "nom", "pseudo", "ligueId", "ligueNom", "provinceId", "provinceNom", "statut"]),
    buildQualityStat("Clubs", data.clubs, ["id", "nom", "categorie", "provinceId", "ligueId", "ligueNom", "ententeId", "ententeNom", "statut"]),
    buildQualityStat("Athletes", data.athletes, ["id", "nomComplet", "dateNaissance", "genre", "provinceId", "ligueId", "clubId", "statut"]),
    buildQualityStat("Coachs", data.coachs, ["id", "nomComplet", "dateNaissance", "genre", "telephone", "email", "niveau", "specialisation", "statut"]),
    buildQualityStat("Arbitres", data.arbitres, [
      "id",
      "nomComplet",
      "dateNaissance",
      "genre",
      "grade",
      "telephone",
      "email",
      "dateHomologation",
      "equipeNational",
      "statut",
    ]),
    buildQualityStat("Medecins", data.medecins, [
      "id",
      "nomComplet",
      "dateNaissance",
      "genre",
      "specialite",
      "niveau",
      "telephone",
      "email",
      "dateAffiliation",
      "numeroOrdre",
      "equipeNationale",
    ]),
    buildQualityStat("Officiels", data.officiels, ["id", "nomComplet", "dateNaissance", "genre", "telephone", "email", "fonction", "entite", "rattachement", "statut"]),
    buildQualityStat("Competitions", data.competitions ?? [], [
      "id",
      "nomCompetition",
      "dateDebut",
      "dateFin",
      "discipline",
      "lieu",
      "niveau",
      "statut",
    ]),
    buildQualityStat("Participants competitions", data.competitionParticipants ?? [], [
      "idParticipation",
      "idCompetition",
      "discipline",
      "typeParticipant",
      "poule",
      "statutParticipation",
    ]),
    buildQualityStat("Unites competitions", data.competitionUnites ?? [], [
      "idUnite",
      "nomUnite",
      "idCompetition",
      "discipline",
      "typeUnite",
      "poule",
    ]),
    buildQualityStat("Resultats competitions", data.competitionResults ?? [], [
      "idResultat",
      "idCompetition",
      "discipline",
      "dateMatch",
      "phase",
      "idUniteA",
      "idUniteB",
      "scoreGlobal",
    ]),
    buildQualityStat("Classement competitions", data.competitionClassements ?? [], [
      "idClassement",
      "idResultat",
      "idCompetition",
      "idUnite",
      "nomUnite",
      "scoreGlobal",
      "resultatMatch",
      "pointsClassement",
    ]),
    buildQualityStat("Transferts", data.transferts ?? [], [
      "id",
      "athleteId",
      "athleteNom",
      "clubOrigineId",
      "clubOrigineNom",
      "clubBeneficiaireId",
      "clubBeneficiaireNom",
      "typeTransfert",
      "saison",
      "statut",
      "dateDebut",
      "dateFin",
    ]),
    buildQualityStat("Equipe nationale", data.equipeNationale ?? [], [
      "idEquipeNationale",
      "nomEquipeNationale",
      "discipline",
      "categorie",
      "genre",
      "saison",
      "statutEquipe",
    ]),
    buildQualityStat("Selections equipe nationale", data.equipeNationaleSelections ?? [], [
      "idSelection",
      "idEquipeNationale",
      "idAthlete",
      "nomAthlete",
      "saison",
      "statutSelection",
    ]),
    buildQualityStat("Competitions equipe nationale", data.equipeNationaleCompetitions ?? [], [
      "idParticipationEn",
      "idEquipeNationale",
      "idCompetition",
      "nomCompetition",
      "statutParticipation",
    ]),
    buildQualityStat("Resultats equipe nationale", data.equipeNationaleResultats ?? [], [
      "idResultatEn",
      "idParticipationEn",
      "idEquipeNationale",
      "idCompetition",
      "dateMatch",
      "adversaire",
      "scoreGlobal",
      "resultatMatch",
    ]),
  ]
}
