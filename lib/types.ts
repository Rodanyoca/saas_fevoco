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
  nom: string
  pseudo: string
  ligueId: string
  ligueNom: string
  provinceId: string
  provinceNom: string
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
  nom: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  pseudoEntente: string
  version: string
  dateAffiliation: string
  presidentId: string
  presidentNom: string
  presidentTelephone: string
  presidentEmail: string
  adresse: string
  statut: Statut

  // Optional computed/legacy fields (not present in the CLUBS sheet today)
  athletes?: number
  genre?: string
}

export interface Athlete {
  id: string
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
  poste: string
  numero: string
  taille: number | null
  poids: number | null
  telephone: string
  email: string
  estCapitaine: boolean | null
  selectionNationale: boolean | null
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
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  clubId: string
  clubNom: string
  equipeId: string
  equipeNom: string
  niveau: string
  specialisation: string
  diplome: string
  dateAffiliation: string
  statut: Statut
}

export interface Officiel {
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  fonction: string
  niveau: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  clubId: string
  clubNom: string
  telephone: string
  email: string
  dateNomination: string
  dateFinMandat: string
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
  clubId: string
  clubNom: string
  equipeId: string
  equipeNom: string
  dateAffiliation: string
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
  experience: string
  statut: Statut
}
