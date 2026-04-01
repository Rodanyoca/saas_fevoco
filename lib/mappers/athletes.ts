import type { Athlete } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function bool(row: SheetRow, key: string): boolean | null {
  const v = row[key]
  if (v === null || v === undefined || v === "") return null
  if (typeof v === "boolean") return v
  const s = String(v).trim().toLowerCase()
  if (s === "true" || s === "vrai" || s === "1" || s === "oui") return true
  if (s === "false" || s === "faux" || s === "0" || s === "non") return false
  return null
}

function num(row: SheetRow, key: string): number | null {
  const v = row[key]
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "number" ? v : Number(String(v))
  if (Number.isNaN(n)) return null
  return n
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  if (v === "blesse" || v === "blessé") return "blesse"
  return raw.trim()
}

export function mapAthleteRow(row: SheetRow): Athlete {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_athlete"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_de_naissance"),
    lieuNaissance: str(row, "lieu_de_naissance"),
    genre: str(row, "genre"),
    nationalite: str(row, "nationalite"),
    adresse: str(row, "adresse_athlete"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    ententeId: str(row, "id_entente"),
    ententeNom: str(row, "nom_entente"),
    clubId: str(row, "id_club"),
    clubNom: str(row, "nom_club"),
    poste: str(row, "poste"),
    numero: str(row, "numero"),
    taille: num(row, "taille"),
    poids: num(row, "poids"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    estCapitaine: bool(row, "est_capitaine"),
    selectionNationale: bool(row, "selection_nationale"),
    statut: normalizeStatut(statutRaw),
  }
}
