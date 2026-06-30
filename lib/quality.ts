import type {
  Arbitre,
  Athlete,
  Club,
  Coach,
  Competition,
  CompetitionParticipant,
  CompetitionResult,
  CompetitionUnite,
  Entente,
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
  transferts?: Transfert[]
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
    buildQualityStat("Clubs", data.clubs, ["id", "nom", "provinceId", "provinceNom", "ligueId", "ligueNom", "ententeId", "ententeNom", "statut"]),
    buildQualityStat("Athletes", data.athletes, ["id", "nomComplet", "dateNaissance", "genre", "provinceId", "ligueId", "clubId", "statut"]),
    buildQualityStat("Coachs", data.coachs, ["id", "nomComplet", "dateNaissance", "genre", "telephone", "email", "niveau", "specialisation", "statut"]),
    buildQualityStat("Arbitres", data.arbitres, ["id", "nomComplet", "dateNaissance", "genre", "grade", "ligueId", "ligueNom", "statut"]),
    buildQualityStat("Medecins", data.medecins, ["id", "nomComplet", "dateNaissance", "genre", "specialite", "niveau", "telephone", "email", "statut"]),
    buildQualityStat("Officiels", data.officiels, ["id", "nomComplet", "dateNaissance", "genre", "fonction", "niveau", "provinceId", "provinceNom", "statut"]),
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
    buildQualityStat("Transferts", data.transferts ?? [], [
      "id",
      "athleteId",
      "athleteNom",
      "clubOrigineId",
      "clubOrigineNom",
      "clubBeneficiaireId",
      "clubBeneficiaireNom",
      "typeTransfert",
      "statut",
      "dateDebut",
      "dateFin",
    ]),
  ]
}
