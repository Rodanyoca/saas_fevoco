import type { Officiel } from "@/lib/types"
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

export function mapOfficielRow(row: SheetRow): Officiel {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_officiel"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_de_naissance"),
    genre: str(row, "genre"),
    fonction: str(row, "fonction"),
    niveau: str(row, "niveau"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    ententeId: str(row, "id_entente"),
    ententeNom: str(row, "nom_entente"),
    clubId: str(row, "id_club"),
    clubNom: str(row, "nom_club"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    dateNomination: str(row, "date_de_nomination"),
    dateFinMandat: str(row, "date_de_fin_de_mandat"),
    statut: normalizeStatut(statutRaw),
  }
}
