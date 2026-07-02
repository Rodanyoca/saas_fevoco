import type { Medecin } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

export function mapMedecinRow(row: SheetRow): Medecin {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_medecin"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_de_naissance"),
    genre: str(row, "genre"),
    specialite: str(row, "specialite"),
    niveau: str(row, "niveau"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    numeroOrdre: str(row, "numero_ordre"),
    equipeNationale: str(row, "equipe_nationale"),
    provinceId: "",
    provinceNom: "",
    ligueId: "",
    ligueNom: "",
    ententeId: "",
    ententeNom: "",
    pseudoEntente: "",
    clubId: "",
    clubNom: "",
    equipeId: "",
    equipeNom: "",
    dateAffiliation: str(row, "date_affiliation"),
    statut: normalizeStatut(statutRaw),
    affiliations: [],
  }
}
