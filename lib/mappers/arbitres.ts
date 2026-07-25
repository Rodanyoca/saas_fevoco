import type { Arbitre } from "@/lib/types"
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

export function mapArbitreRow(row: SheetRow): Arbitre {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    idArbitre: str(row, "id_arbitre"),
    idNational: str(row, "id_national"),
    idFivb: str(row, "id_fivb"),
    sexe: str(row, "sexe"),
    dateDeNaissance: str(row, "date_de_naissance"),
    nationalite: str(row, "nationalite"),
    niveau: str(row, "niveau"),
    avatarDriveId: str(row, "avatar_drive_id"),
    avatarDriveUrl: str(row, "avatar_drive_url"),
    id: str(row, "id_arbitre"),
    nomComplet: str(row, "nom"),
    dateNaissance: str(row, "date_de_naissance"),
    genre: str(row, "sexe"),
    grade: str(row, "niveau"),
    provinceId: "",
    provinceNom: "",
    ligueId: "",
    ligueNom: "",
    ententeId: "",
    ententeNom: "",
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    adresse: str(row, "adresse"),
    dateAffiliation: str(row, "date_affiliation"),
    dateHomologation: str(row, "date_homologation"),
    equipeNational: str(row, "equipe_national"),
    experience: "",
    statut: normalizeStatut(statutRaw),
  }
}
