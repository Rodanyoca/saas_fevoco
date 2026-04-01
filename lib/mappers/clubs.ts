import type { Club } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

export function mapClubRow(row: SheetRow): Club {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_club"),
    nom: str(row, "nom_club"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    ententeId: str(row, "id_entente"),
    ententeNom: str(row, "nom_entente"),
    pseudoEntente: str(row, "pseudo_entente"),
    version: str(row, "version"),
    dateAffiliation: str(row, "date_affiliation"),
    presidentId: str(row, "id_president_club"),
    presidentNom: str(row, "nom_president_club"),
    presidentTelephone: str(row, "telephone_president_club"),
    presidentEmail: str(row, "email_president_club"),
    adresse: str(row, "adresse_club"),
    statut: normalizeStatut(statutRaw),
  }
}
