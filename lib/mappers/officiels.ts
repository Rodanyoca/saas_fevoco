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
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    adresse: str(row, "adresse"),
    fonction: str(row, "fonction"),
    entite: str(row, "entite"),
    dateNomination: str(row, "date_de_nomination"),
    dateFinMandat: str(row, "date_de_fin_de_mandat"),
    equipeFederal: str(row, "equipe_federal"),
    statut: normalizeStatut(statutRaw),
  }
}
