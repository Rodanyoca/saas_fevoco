export type Statut = string

export interface Province {
  id: string
  nom: string
  chefLieu: string
  responsable: string
  telephone: string
  email: string
  statut: "active" | "inactive" | string

  ligues: number
  ententes: number
  clubs: number
  athletes: number
  coachs: number
  arbitres: number
  medecins: number
  completude: number
}

export interface Ligue {
  id: string
  nom: string
  provinceId: string
  provinceNom: string
  emailLigue: string
  presidentId: string
  presidentNom: string
  presidentTelephone: string
  presidentEmail: string
  secretaireId: string
  secretaireNom: string
  secretaireTelephone: string
  secretaireEmail: string
  statut: Statut

  // Optional legacy/display fields (if present in the sheet)
  ententes?: number
  clubs?: number
  athletes?: number
}

export interface Entente {
  id: string
  numeroOrdre: string
  nom: string
  pseudo: string
  ligueId: string
  ligueNom: string
  provinceId: string
  provinceNom: string
  personneContactId: string
  personneContactNom: string
  personneContactTelephone: string
  presidentId: string
  presidentNom: string
  presidentTelephone: string
  presidentEmail: string
  secretaireId: string
  secretaireNom: string
  secretaireTelephone: string
  secretaireEmail: string
  statut: Statut

  // Optional computed/legacy fields (not present in the ENTENTES sheet today)
  clubs?: number
  athletes?: number
}

export interface Club {
  id: string
  numeroOrdre: string
  nom: string
  categorie: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  pseudoEntente: string
  version: string
  dateAffiliation: string
  personneContactNom: string
  personneContactTelephone: string
  presidentId: string
  presidentNom: string
  presidentTelephone: string
  presidentEmail: string
  adresse: string
  statut: Statut

  // Optional computed fields
  athletes?: number
}

export interface Athlete {
  id: string
  numeroOrdre: string
  nomComplet: string
  dateNaissance: string
  lieuNaissance: string
  genre: string
  nationalite: string
  adresse: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  clubId: string
  clubNom: string
  disciplineActive: string
  posteIndoor: string
  posteBeach: string
  numero: string
  taille: number | null
  poids: number | null
  telephone: string
  email: string
  statut: Statut
}

export interface Coach {
  id: string
  nomComplet: string
  dateNaissance: string
  lieuNaissance: string
  genre: string
  nationalite: string
  telephone: string
  email: string
  niveau: string
  specialisation: string
  dateAffiliation: string
  statut: Statut
}

export interface CoachAffiliation {
  id: string
  coachId: string
  role: string
  equipeId: string
  equipeNom: string
  dateDebut: string
  dateFin: string
  statut: Statut
}

export interface Officiel {
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entite: string
  dateNomination: string
  dateFinMandat: string
  equipeFederal: string
  statut: Statut
}

export interface Medecin {
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  specialite: string
  niveau: string
  telephone: string
  email: string
  numeroOrdre: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  pseudoEntente: string
  clubId: string
  clubNom: string
  equipeId: string
  equipeNom: string
  dateAffiliation: string
  statut: Statut
  affiliations: MedecinAffiliation[]
}

export interface MedecinAffiliation {
  medecinId: string
  medecinNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  pseudoEntente: string
  clubId: string
  clubNom: string
  dateDebut: string
  dateFin: string
  statut: Statut
}

export interface Arbitre {
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  grade: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  telephone: string
  email: string
  dateHomologation: string
  equipeNational: string
  experience: string
  statut: Statut
}

export type CompetitionDiscipline = "INDOOR" | "BEACH" | string

export interface Competition {
  id: string
  nomCompetition: string
  dateDebut: string
  dateFin: string
  discipline: CompetitionDiscipline
  lieu: string
  niveau: string
  statut: Statut
  suiviCno: string
}

export interface CompetitionParticipant {
  idParticipation: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  typeParticipant: string
  idClub: string
  nomClub: string
  poule: string
  idAthlete: string
  nomAthlete: string
  statutParticipation: string
  exportCoc: string
}

export interface CompetitionUnite {
  idUnite: string
  nomUnite: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  typeUnite: string
  poule: string
  idClub: string
  nomClub: string
  idAthleteA: string
  nomAthleteA: string
  idAthleteB: string
  nomAthleteB: string
}

export interface CompetitionResult {
  idResultat: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  dateMatch: string
  phase: string
  poule: string
  idUniteA: string
  nomUniteA: string
  idUniteB: string
  nomUniteB: string
  scoreGlobal: string
  set1A: number | null
  set1B: number | null
  set2A: number | null
  set2B: number | null
  set3A: number | null
  set3B: number | null
  set4A: number | null
  set4B: number | null
  set5A: number | null
  set5B: number | null
  totalPointA: number | null
  totalPointB: number | null
  pointsClassementA: number | null
  pointsClassementB: number | null
  idUniteVainqueur: string
  vainqueur: string
  statutMatch: string
}

export interface CompetitionClassement {
  idClassement: string
  idResultat: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  phase: string
  poule: string
  idUnite: string
  nomUnite: string
  typeUnite: string
  adversaire: string
  scoreGlobal: string
  resultatMatch: string
  setsGagnes: number | null
  setsPerdus: number | null
  pointsGagnes: number | null
  pointsPerdus: number | null
  differenceSets: number | null
  differencePoints: number | null
  pointsClassement: number | null
  rang: number | null
}

export interface Transfert {
  id: string
  athleteId: string
  athleteNom: string
  clubOrigineId: string
  clubOrigineNom: string
  clubBeneficiaireId: string
  clubBeneficiaireNom: string
  typeTransfert: string
  duree: string
  statut: Statut
  dateValidation: string
  dateDebut: string
  dateFin: string
}

export interface EquipeNationale {
  idSelection: string
  idAthlete: string
  nomAthlete: string
  genre: string
  discipline: string
  poste: string
  idClub: string
  nomClub: string
  entiteNationale: string
  statutSelection: Statut
  saison: string
  observations: string
}

export interface EquipeNationaleSuivi {
  idSuivi: string
  idSelection: string
  idResultat: string
  idAthlete: string
  nomAthlete: string
  entiteNationale: string
  idCompetition: string
  nomCompetition: string
  niveauCompetition: string
  dateMatch: string
  adversaire: string
  scoreGlobal: string
  resultatMatch: string
  pointsSuivi: number | null
}
