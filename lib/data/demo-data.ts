// ============================================
// DONNÉES DE DÉMONSTRATION - FEVOCO
// Limité à 5 éléments par catégorie
// ============================================

export interface Province {
  id: string
  nom: string
  ligues: number
  ententes: number
  clubs: number
  athletes: number
  completude: number
  coachs: number
  arbitres: number
  medecins: number
  chefLieu: string
  responsable: string
  telephone: string
  email: string
  statut: "active" | "inactive"
}

export interface Ligue {
  id: string
  nom: string
  province: string
  ententes: number
  clubs: number
  athletes: number
  statut: "active" | "inactive"
}

export interface Club {
  id: string
  nom: string
  version: string
  genre: "Masculin" | "Féminin" | "Mixte"
  entente: string
  ligue: string
  province: string
  athletes: number
  statut: "actif" | "inactif"
  dateCreation: string
  responsable: string
  telephone: string
  email: string
  adresse: string
  logo?: string
}

export interface Athlete {
  id: string
  nom: string
  prenom: string
  genre: "M" | "F"
  dateNaissance: string
  club: string
  version: string
  ligue: string
  selectionNationale: boolean
  poste: string
  taille: number
  poids: number
  telephone: string
  email: string
  adresse: string
  photo?: string
  statut: "actif" | "inactif" | "blesse"
  dateInscription: string
}

export interface Entente {
  id: string
  nom: string
  ligue: string
  province: string
  clubs: number
  athletes: number
  responsable: string
  telephone: string
  statut: "active" | "inactive"
}

export interface Coach {
  id: string
  nom: string
  prenom: string
  genre: "M" | "F"
  dateNaissance: string
  club: string
  ligue: string
  specialite: string
  niveauCertification: "National" | "Provincial" | "Local"
  telephone: string
  email: string
  adresse: string
  photo?: string
  statut: "actif" | "inactif"
  dateEmbauche: string
  experience: number
}

export interface Arbitre {
  id: string
  nom: string
  prenom: string
  genre: "M" | "F"
  dateNaissance: string
  ligue: string
  province: string
  grade: "International" | "National" | "Provincial" | "Local"
  specialite: "Premier arbitre" | "Second arbitre" | "Marqueur" | "Juge de ligne"
  telephone: string
  email: string
  adresse: string
  photo?: string
  statut: "actif" | "inactif" | "suspendu"
  dateObtentionGrade: string
  matchsArbitres: number
}

export interface Medecin {
  id: string
  nom: string
  prenom: string
  genre: "M" | "F"
  dateNaissance: string
  ligue: string
  province: string
  specialite: "Médecine du sport" | "Traumatologie" | "Kinésithérapie" | "Médecine générale"
  numeroOrdre: string
  telephone: string
  email: string
  adresse: string
  hopital: string
  photo?: string
  statut: "actif" | "inactif"
  dateAffiliation: string
  athletesSuivis: number
}

export interface Officiel {
  id: string
  nom: string
  prenom: string
  genre: "M" | "F"
  poste: "Secrétaire" | "Trésorier" | "Chargé des compétitions" | "Responsable administratif"
  province: string
  entite: string
  dateNaissance: string
  nationalite: string
  telephone: string
  email: string
  statut: "actif" | "inactif"
}

export interface DataQualityIssue {
  id: string
  entite: "athlete" | "club" | "coach" | "arbitre" | "medecin"
  entiteId: string
  entiteNom: string
  champManquant: string
  province: string
  ligue: string
  dateDetection: string
  priorite: "haute" | "moyenne" | "basse"
  statut: "non_resolu" | "en_cours" | "resolu"
}

export interface DataQualityStats {
  entite: string
  total: number
  complets: number
  incomplets: number
  tauxCompletude: number
}

export interface RecentActivity {
  id: string
  type: "club" | "athlete" | "ligue" | "entente"
  action: string
  date: string
  description: string
}

// --- PROVINCES (5 max) ---
export const provinces: Province[] = [
  { id: "p1", nom: "Kinshasa", ligues: 1, ententes: 4, clubs: 12, athletes: 180, completude: 92, coachs: 12, arbitres: 8, medecins: 4, chefLieu: "Kinshasa", responsable: "André Mbemba", telephone: "+243 811 000 001", email: "kinshasa@fevoco.cd", statut: "active" },
  { id: "p2", nom: "Haut-Katanga", ligues: 1, ententes: 3, clubs: 8, athletes: 95, completude: 78, coachs: 8, arbitres: 5, medecins: 2, chefLieu: "Lubumbashi", responsable: "Pierre Mwamba", telephone: "+243 822 000 002", email: "hkatanga@fevoco.cd", statut: "active" },
  { id: "p3", nom: "Nord-Kivu", ligues: 1, ententes: 2, clubs: 6, athletes: 72, completude: 85, coachs: 6, arbitres: 4, medecins: 2, chefLieu: "Goma", responsable: "Innocent Bahati", telephone: "+243 833 000 003", email: "nkivu@fevoco.cd", statut: "active" },
  { id: "p4", nom: "Kongo Central", ligues: 1, ententes: 2, clubs: 5, athletes: 58, completude: 70, coachs: 4, arbitres: 3, medecins: 1, chefLieu: "Matadi", responsable: "Joseph Nsimba", telephone: "+243 844 000 004", email: "kcentral@fevoco.cd", statut: "active" },
  { id: "p5", nom: "Sud-Kivu", ligues: 1, ententes: 2, clubs: 4, athletes: 45, completude: 65, coachs: 3, arbitres: 2, medecins: 1, chefLieu: "Bukavu", responsable: "Marie Lwango", telephone: "+243 855 000 005", email: "skivu@fevoco.cd", statut: "inactive" },
]

// --- LIGUES (5 max) ---
export const ligues: Ligue[] = [
  { id: "l1", nom: "Ligue de Kinshasa", province: "Kinshasa", ententes: 4, clubs: 12, athletes: 180, statut: "active" },
  { id: "l2", nom: "Ligue du Haut-Katanga", province: "Haut-Katanga", ententes: 3, clubs: 8, athletes: 95, statut: "active" },
  { id: "l3", nom: "Ligue du Nord-Kivu", province: "Nord-Kivu", ententes: 2, clubs: 6, athletes: 72, statut: "active" },
  { id: "l4", nom: "Ligue du Kongo Central", province: "Kongo Central", ententes: 2, clubs: 5, athletes: 58, statut: "active" },
  { id: "l5", nom: "Ligue du Sud-Kivu", province: "Sud-Kivu", ententes: 2, clubs: 4, athletes: 45, statut: "inactive" },
]

// --- ENTENTES (5 max) ---
export const ententes: Entente[] = [
  { id: "e1", nom: "Entente Gombe", ligue: "Ligue de Kinshasa", province: "Kinshasa", clubs: 4, athletes: 52, responsable: "Jean Mukendi", telephone: "+243 812 345 678", statut: "active" },
  { id: "e2", nom: "Entente Ngaliema", ligue: "Ligue de Kinshasa", province: "Kinshasa", clubs: 3, athletes: 45, responsable: "Marie Kalala", telephone: "+243 823 456 789", statut: "active" },
  { id: "e3", nom: "Entente Lubumbashi", ligue: "Ligue du Haut-Katanga", province: "Haut-Katanga", clubs: 4, athletes: 48, responsable: "Patrick Ilunga", telephone: "+243 834 567 890", statut: "active" },
  { id: "e4", nom: "Entente Goma", ligue: "Ligue du Nord-Kivu", province: "Nord-Kivu", clubs: 3, athletes: 38, responsable: "Grace Bahati", telephone: "+243 845 678 901", statut: "active" },
  { id: "e5", nom: "Entente Matadi", ligue: "Ligue du Kongo Central", province: "Kongo Central", clubs: 2, athletes: 25, responsable: "David Nsimba", telephone: "+243 856 789 012", statut: "inactive" },
]

// --- CLUBS (5 max) ---
export const clubs: Club[] = [
  { id: "c1", nom: "VC Espoir", version: "Féminin", genre: "Féminin", entente: "Entente Gombe", ligue: "Ligue de Kinshasa", province: "Kinshasa", athletes: 18, statut: "actif", dateCreation: "2018-03-15", responsable: "Alice Mbuyi", telephone: "+243 811 111 111", email: "espoir@fevoco.cd", adresse: "Avenue de la Paix 45, Gombe, Kinshasa" },
  { id: "c2", nom: "AS Vita Club", version: "Masculin", genre: "Masculin", entente: "Entente Ngaliema", ligue: "Ligue de Kinshasa", province: "Kinshasa", athletes: 22, statut: "actif", dateCreation: "1995-06-20", responsable: "Bernard Kasa", telephone: "+243 822 222 222", email: "vita@fevoco.cd", adresse: "Boulevard du 30 Juin 120, Ngaliema, Kinshasa" },
  { id: "c3", nom: "TP Mazembe", version: "Masculin", genre: "Masculin", entente: "Entente Lubumbashi", ligue: "Ligue du Haut-Katanga", province: "Haut-Katanga", athletes: 20, statut: "actif", dateCreation: "1999-01-10", responsable: "Charles Mwamba", telephone: "+243 833 333 333", email: "mazembe@fevoco.cd", adresse: "Avenue Mobutu 78, Lubumbashi" },
  { id: "c4", nom: "BC Goma", version: "Féminin", genre: "Féminin", entente: "Entente Goma", ligue: "Ligue du Nord-Kivu", province: "Nord-Kivu", athletes: 15, statut: "actif", dateCreation: "2015-09-05", responsable: "Diana Furaha", telephone: "+243 844 444 444", email: "bcgoma@fevoco.cd", adresse: "Rue du Lac 23, Goma" },
  { id: "c5", nom: "VC Renaissance", version: "Mixte", genre: "Mixte", entente: "Entente Matadi", ligue: "Ligue du Kongo Central", province: "Kongo Central", athletes: 12, statut: "inactif", dateCreation: "2020-02-28", responsable: "Emmanuel Nsimba", telephone: "+243 855 555 555", email: "renaissance@fevoco.cd", adresse: "Avenue du Port 56, Matadi" },
]

// --- ATHLETES (5 max) ---
export const athletes: Athlete[] = [
  { id: "a1", nom: "Kabongo", prenom: "Patrick", genre: "M", dateNaissance: "1998-05-12", club: "AS Vita Club", version: "Masculin", ligue: "Ligue de Kinshasa", selectionNationale: true, poste: "Pointu", taille: 192, poids: 85, telephone: "+243 811 001 001", email: "p.kabongo@fevoco.cd", adresse: "Quartier Binza, Kinshasa", statut: "actif", dateInscription: "2020-01-15" },
  { id: "a2", nom: "Mutombo", prenom: "Grace", genre: "F", dateNaissance: "2001-08-23", club: "VC Espoir", version: "Féminin", ligue: "Ligue de Kinshasa", selectionNationale: true, poste: "Libero", taille: 168, poids: 58, telephone: "+243 822 002 002", email: "g.mutombo@fevoco.cd", adresse: "Quartier Gombe, Kinshasa", statut: "actif", dateInscription: "2021-03-20" },
  { id: "a3", nom: "Kalala", prenom: "David", genre: "M", dateNaissance: "1999-02-14", club: "TP Mazembe", version: "Masculin", ligue: "Ligue du Haut-Katanga", selectionNationale: false, poste: "Central", taille: 198, poids: 92, telephone: "+243 833 003 003", email: "d.kalala@fevoco.cd", adresse: "Commune Kenya, Lubumbashi", statut: "actif", dateInscription: "2019-08-10" },
  { id: "a4", nom: "Ngoy", prenom: "Blessing", genre: "F", dateNaissance: "2000-11-30", club: "BC Goma", version: "Féminin", ligue: "Ligue du Nord-Kivu", selectionNationale: true, poste: "Passeuse", taille: 175, poids: 65, telephone: "+243 844 004 004", email: "b.ngoy@fevoco.cd", adresse: "Centre-ville, Goma", statut: "blesse", dateInscription: "2020-06-05" },
  { id: "a5", nom: "Lumumba", prenom: "Jean", genre: "M", dateNaissance: "1997-07-08", club: "VC Renaissance", version: "Mixte", ligue: "Ligue du Kongo Central", selectionNationale: false, poste: "Receptionniste", taille: 185, poids: 78, telephone: "+243 855 005 005", email: "j.lumumba@fevoco.cd", adresse: "Port de Matadi", statut: "inactif", dateInscription: "2018-02-28" },
]

// --- COACHS (5 max) ---
export const coachs: Coach[] = [
  { id: "co1", nom: "Mbala", prenom: "Joseph", genre: "M", dateNaissance: "1975-03-20", club: "AS Vita Club", ligue: "Ligue de Kinshasa", specialite: "Attaque", niveauCertification: "National", telephone: "+243 811 100 100", email: "j.mbala@fevoco.cd", adresse: "Quartier Bandalungwa, Kinshasa", statut: "actif", dateEmbauche: "2015-01-10", experience: 15 },
  { id: "co2", nom: "Kayembe", prenom: "Francine", genre: "F", dateNaissance: "1982-07-15", club: "VC Espoir", ligue: "Ligue de Kinshasa", specialite: "Defense", niveauCertification: "National", telephone: "+243 822 200 200", email: "f.kayembe@fevoco.cd", adresse: "Quartier Limete, Kinshasa", statut: "actif", dateEmbauche: "2018-03-20", experience: 10 },
  { id: "co3", nom: "Tshibangu", prenom: "Robert", genre: "M", dateNaissance: "1978-11-08", club: "TP Mazembe", ligue: "Ligue du Haut-Katanga", specialite: "Preparation physique", niveauCertification: "Provincial", telephone: "+243 833 300 300", email: "r.tshibangu@fevoco.cd", adresse: "Commune Annexe, Lubumbashi", statut: "actif", dateEmbauche: "2016-06-15", experience: 12 },
  { id: "co4", nom: "Amisi", prenom: "Beatrice", genre: "F", dateNaissance: "1985-04-25", club: "BC Goma", ligue: "Ligue du Nord-Kivu", specialite: "Technique", niveauCertification: "Provincial", telephone: "+243 844 400 400", email: "b.amisi@fevoco.cd", adresse: "Quartier Himbi, Goma", statut: "actif", dateEmbauche: "2019-09-01", experience: 8 },
  { id: "co5", nom: "Konde", prenom: "Michel", genre: "M", dateNaissance: "1980-09-12", club: "VC Renaissance", ligue: "Ligue du Kongo Central", specialite: "Strategie", niveauCertification: "Local", telephone: "+243 855 500 500", email: "m.konde@fevoco.cd", adresse: "Centre-ville, Matadi", statut: "inactif", dateEmbauche: "2020-02-15", experience: 6 },
]

// --- ARBITRES (5 max) ---
export const arbitres: Arbitre[] = [
  { id: "ar1", nom: "Mukeba", prenom: "Simon", genre: "M", dateNaissance: "1980-06-15", ligue: "Ligue de Kinshasa", province: "Kinshasa", grade: "International", specialite: "Premier arbitre", telephone: "+243 811 600 600", email: "s.mukeba@fevoco.cd", adresse: "Quartier Kintambo, Kinshasa", statut: "actif", dateObtentionGrade: "2015-03-20", matchsArbitres: 245 },
  { id: "ar2", nom: "Ilunga", prenom: "Jeanne", genre: "F", dateNaissance: "1985-09-22", ligue: "Ligue de Kinshasa", province: "Kinshasa", grade: "National", specialite: "Second arbitre", telephone: "+243 822 700 700", email: "j.ilunga@fevoco.cd", adresse: "Quartier Masina, Kinshasa", statut: "actif", dateObtentionGrade: "2018-07-10", matchsArbitres: 128 },
  { id: "ar3", nom: "Katanga", prenom: "Pierre", genre: "M", dateNaissance: "1978-02-08", ligue: "Ligue du Haut-Katanga", province: "Haut-Katanga", grade: "National", specialite: "Premier arbitre", telephone: "+243 833 800 800", email: "p.katanga@fevoco.cd", adresse: "Commune Kampemba, Lubumbashi", statut: "actif", dateObtentionGrade: "2016-11-15", matchsArbitres: 186 },
  { id: "ar4", nom: "Bahati", prenom: "Esperance", genre: "F", dateNaissance: "1990-12-03", ligue: "Ligue du Nord-Kivu", province: "Nord-Kivu", grade: "Provincial", specialite: "Marqueur", telephone: "+243 844 900 900", email: "e.bahati@fevoco.cd", adresse: "Quartier Virunga, Goma", statut: "actif", dateObtentionGrade: "2020-05-25", matchsArbitres: 67 },
  { id: "ar5", nom: "Nsimba", prenom: "Alain", genre: "M", dateNaissance: "1982-04-18", ligue: "Ligue du Kongo Central", province: "Kongo Central", grade: "Local", specialite: "Juge de ligne", telephone: "+243 855 100 100", email: "a.nsimba@fevoco.cd", adresse: "Avenue Lumumba, Matadi", statut: "suspendu", dateObtentionGrade: "2021-02-10", matchsArbitres: 42 },
]

// --- MEDECINS (5 max) ---
export const medecins: Medecin[] = [
  { id: "me1", nom: "Tshimanga", prenom: "Olivier", genre: "M", dateNaissance: "1972-05-18", ligue: "Ligue de Kinshasa", province: "Kinshasa", specialite: "Médecine du sport", numeroOrdre: "OM-KIN-2345", telephone: "+243 811 700 700", email: "o.tshimanga@fevoco.cd", adresse: "Avenue des Cliniques 12, Gombe", hopital: "Clinique Ngaliema", statut: "actif", dateAffiliation: "2016-04-15", athletesSuivis: 85 },
  { id: "me2", nom: "Mwanza", prenom: "Elisabeth", genre: "F", dateNaissance: "1980-11-25", ligue: "Ligue de Kinshasa", province: "Kinshasa", specialite: "Traumatologie", numeroOrdre: "OM-KIN-3456", telephone: "+243 822 800 800", email: "e.mwanza@fevoco.cd", adresse: "Boulevard Lumumba 78, Limete", hopital: "Hopital Général de Kinshasa", statut: "actif", dateAffiliation: "2018-09-20", athletesSuivis: 62 },
  { id: "me3", nom: "Kabila", prenom: "Jacques", genre: "M", dateNaissance: "1975-03-10", ligue: "Ligue du Haut-Katanga", province: "Haut-Katanga", specialite: "Kinésithérapie", numeroOrdre: "OM-KAT-1234", telephone: "+243 833 900 900", email: "j.kabila@fevoco.cd", adresse: "Avenue Kasavubu 45, Lubumbashi", hopital: "Clinique Sendwe", statut: "actif", dateAffiliation: "2017-06-10", athletesSuivis: 48 },
  { id: "me4", nom: "Furaha", prenom: "Marie", genre: "F", dateNaissance: "1985-08-14", ligue: "Ligue du Nord-Kivu", province: "Nord-Kivu", specialite: "Médecine du sport", numeroOrdre: "OM-NKV-5678", telephone: "+243 844 100 100", email: "m.furaha@fevoco.cd", adresse: "Rue du Lac 34, Goma", hopital: "Hopital CBCA Ndosho", statut: "actif", dateAffiliation: "2020-01-25", athletesSuivis: 35 },
  { id: "me5", nom: "Lukusa", prenom: "Paul", genre: "M", dateNaissance: "1978-12-02", ligue: "Ligue du Kongo Central", province: "Kongo Central", specialite: "Médecine générale", numeroOrdre: "OM-KGC-7890", telephone: "+243 855 200 200", email: "p.lukusa@fevoco.cd", adresse: "Avenue du Port 23, Matadi", hopital: "Hopital Général de Matadi", statut: "inactif", dateAffiliation: "2019-03-15", athletesSuivis: 22 },
]

// --- OFFICIELS (5 max) ---
export const officiels: Officiel[] = [
  { id: "of1", nom: "Mbemba", prenom: "André", genre: "M", poste: "Responsable administratif", province: "Kinshasa", entite: "FEVOCO", dateNaissance: "1979-04-12", nationalite: "Congolaise", telephone: "+243 811 000 010", email: "a.mbemba@fevoco.cd", statut: "actif" },
  { id: "of2", nom: "Mwamba", prenom: "Pierre", genre: "M", poste: "Chargé des compétitions", province: "Haut-Katanga", entite: "Ligue du Haut-Katanga", dateNaissance: "1984-09-03", nationalite: "Congolaise", telephone: "+243 822 000 020", email: "p.mwamba@fevoco.cd", statut: "actif" },
  { id: "of3", nom: "Bahati", prenom: "Innocent", genre: "M", poste: "Secrétaire", province: "Nord-Kivu", entite: "Ligue du Nord-Kivu", dateNaissance: "1988-01-19", nationalite: "Congolaise", telephone: "+243 833 000 030", email: "i.bahati@fevoco.cd", statut: "actif" },
  { id: "of4", nom: "Nsimba", prenom: "Joseph", genre: "M", poste: "Trésorier", province: "Kongo Central", entite: "Ligue du Kongo Central", dateNaissance: "1976-06-27", nationalite: "Congolaise", telephone: "+243 844 000 040", email: "j.nsimba@fevoco.cd", statut: "inactif" },
  { id: "of5", nom: "Lwango", prenom: "Marie", genre: "F", poste: "Secrétaire", province: "Sud-Kivu", entite: "Ligue du Sud-Kivu", dateNaissance: "1990-11-08", nationalite: "Congolaise", telephone: "+243 855 000 050", email: "m.lwango@fevoco.cd", statut: "actif" },
]

// --- QUALITÉ DES DONNÉES (5 max) ---
export const dataQualityIssues: DataQualityIssue[] = [
  { id: "dq1", entite: "athlete", entiteId: "a5", entiteNom: "Jean Lumumba", champManquant: "Photo", province: "Kongo Central", ligue: "Ligue du Kongo Central", dateDetection: "2024-01-10", priorite: "basse", statut: "non_resolu" },
  { id: "dq2", entite: "club", entiteId: "c5", entiteNom: "VC Renaissance", champManquant: "Logo", province: "Kongo Central", ligue: "Ligue du Kongo Central", dateDetection: "2024-01-08", priorite: "moyenne", statut: "non_resolu" },
  { id: "dq3", entite: "athlete", entiteId: "a3", entiteNom: "David Kalala", champManquant: "Email", province: "Haut-Katanga", ligue: "Ligue du Haut-Katanga", dateDetection: "2024-01-05", priorite: "haute", statut: "en_cours" },
  { id: "dq4", entite: "coach", entiteId: "co5", entiteNom: "Michel Konde", champManquant: "Photo", province: "Kongo Central", ligue: "Ligue du Kongo Central", dateDetection: "2024-01-03", priorite: "basse", statut: "non_resolu" },
  { id: "dq5", entite: "arbitre", entiteId: "ar5", entiteNom: "Alain Nsimba", champManquant: "Photo", province: "Kongo Central", ligue: "Ligue du Kongo Central", dateDetection: "2024-01-02", priorite: "basse", statut: "resolu" },
]

export const dataQualityStats: DataQualityStats[] = [
  { entite: "Athletes", total: 450, complets: 412, incomplets: 38, tauxCompletude: 92 },
  { entite: "Ligues", total: 5, complets: 5, incomplets: 0, tauxCompletude: 100 },
  { entite: "Ententes", total: 13, complets: 12, incomplets: 1, tauxCompletude: 92 },
  { entite: "Clubs", total: 35, complets: 31, incomplets: 4, tauxCompletude: 89 },
  { entite: "Coachs", total: 42, complets: 38, incomplets: 4, tauxCompletude: 90 },
  { entite: "Arbitres", total: 28, complets: 25, incomplets: 3, tauxCompletude: 89 },
  { entite: "Médecins", total: 8, complets: 7, incomplets: 1, tauxCompletude: 88 },
]

// --- ACTIVITÉS RÉCENTES (5 max) ---
export const recentActivities: RecentActivity[] = [
  { id: "r1", type: "athlete", action: "Inscription", date: "2024-01-15", description: "Patrick Kabongo inscrit à AS Vita Club" },
  { id: "r2", type: "club", action: "Création", date: "2024-01-14", description: "Nouveau club VC Espoir créé" },
  { id: "r3", type: "ligue", action: "Validation", date: "2024-01-13", description: "Ligue du Nord-Kivu validée" },
  { id: "r4", type: "athlete", action: "Mise à jour", date: "2024-01-12", description: "Profil de Grace Mutombo mis à jour" },
  { id: "r5", type: "entente", action: "Création", date: "2024-01-11", description: "Entente Gombe créée à Kinshasa" },
]

// --- STATISTIQUES GLOBALES ---
export const statsGlobales = {
  totalProvinces: 5,
  totalLigues: 5,
  totalEntentes: 5,
  totalClubs: 5,
  totalAthletes: 5,
  totalCoachs: 5,
  totalArbitres: 5,
  totalOfficiels: 5,
  totalMedecins: 5,
  athletesMasculins: 3,
  athletesFeminins: 2,
  selectionNationale: 3,
  tauxCompletude: 82,
  clubsActifs: 4,
  clubsInactifs: 1,
}

// --- RÉPARTITION PAR GENRE (pour graphiques) ---
export const repartitionGenre = [
  { genre: "Masculin", count: 3 },
  { genre: "Féminin", count: 2 },
]

// --- TOP PROVINCES (pour graphiques) ---
export const topProvinces = provinces.slice(0, 5).map(p => ({
  nom: p.nom,
  athletes: p.athletes,
}))
