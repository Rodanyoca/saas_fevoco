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

export interface RecentActivity {
  id: string
  type: "club" | "athlete" | "ligue" | "entente"
  action: string
  date: string
  description: string
}

// --- PROVINCES (5 max) ---
export const provinces: Province[] = [
  { id: "p1", nom: "Kinshasa", ligues: 1, ententes: 4, clubs: 12, athletes: 180, completude: 92 },
  { id: "p2", nom: "Haut-Katanga", ligues: 1, ententes: 3, clubs: 8, athletes: 95, completude: 78 },
  { id: "p3", nom: "Nord-Kivu", ligues: 1, ententes: 2, clubs: 6, athletes: 72, completude: 85 },
  { id: "p4", nom: "Kongo Central", ligues: 1, ententes: 2, clubs: 5, athletes: 58, completude: 70 },
  { id: "p5", nom: "Sud-Kivu", ligues: 1, ententes: 2, clubs: 4, athletes: 45, completude: 65 },
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
  { id: "c1", nom: "VC Espoir", version: "Féminin", genre: "Féminin", entente: "Entente Gombe", ligue: "Ligue de Kinshasa", province: "Kinshasa", athletes: 18, statut: "actif" },
  { id: "c2", nom: "AS Vita Club", version: "Masculin", genre: "Masculin", entente: "Entente Ngaliema", ligue: "Ligue de Kinshasa", province: "Kinshasa", athletes: 22, statut: "actif" },
  { id: "c3", nom: "TP Mazembe", version: "Masculin", genre: "Masculin", entente: "Entente Lubumbashi", ligue: "Ligue du Haut-Katanga", province: "Haut-Katanga", athletes: 20, statut: "actif" },
  { id: "c4", nom: "BC Goma", version: "Féminin", genre: "Féminin", entente: "Entente Goma", ligue: "Ligue du Nord-Kivu", province: "Nord-Kivu", athletes: 15, statut: "actif" },
  { id: "c5", nom: "VC Renaissance", version: "Mixte", genre: "Mixte", entente: "Entente Matadi", ligue: "Ligue du Kongo Central", province: "Kongo Central", athletes: 12, statut: "inactif" },
]

// --- ATHLETES (5 max) ---
export const athletes: Athlete[] = [
  { id: "a1", nom: "Kabongo", prenom: "Patrick", genre: "M", dateNaissance: "1998-05-12", club: "AS Vita Club", version: "Masculin", ligue: "Ligue de Kinshasa", selectionNationale: true },
  { id: "a2", nom: "Mutombo", prenom: "Grace", genre: "F", dateNaissance: "2001-08-23", club: "VC Espoir", version: "Féminin", ligue: "Ligue de Kinshasa", selectionNationale: true },
  { id: "a3", nom: "Kalala", prenom: "David", genre: "M", dateNaissance: "1999-02-14", club: "TP Mazembe", version: "Masculin", ligue: "Ligue du Haut-Katanga", selectionNationale: false },
  { id: "a4", nom: "Ngoy", prenom: "Blessing", genre: "F", dateNaissance: "2000-11-30", club: "BC Goma", version: "Féminin", ligue: "Ligue du Nord-Kivu", selectionNationale: true },
  { id: "a5", nom: "Lumumba", prenom: "Jean", genre: "M", dateNaissance: "1997-07-08", club: "VC Renaissance", version: "Mixte", ligue: "Ligue du Kongo Central", selectionNationale: false },
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
  totalEntentes: 13,
  totalClubs: 35,
  totalAthletes: 450,
  totalCoachs: 42,
  totalArbitres: 28,
  totalOfficiels: 15,
  totalMedecins: 8,
  athletesMasculins: 268,
  athletesFeminins: 182,
  selectionNationale: 24,
  tauxCompletude: 82,
  clubsActifs: 31,
  clubsInactifs: 4,
}

// --- RÉPARTITION PAR GENRE (pour graphiques) ---
export const repartitionGenre = [
  { genre: "Masculin", count: 268 },
  { genre: "Féminin", count: 182 },
]

// --- TOP PROVINCES (pour graphiques) ---
export const topProvinces = provinces.slice(0, 5).map(p => ({
  nom: p.nom,
  athletes: p.athletes,
}))
