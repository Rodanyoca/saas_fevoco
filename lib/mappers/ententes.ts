import type { Entente } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "active"
  if (v === "inactif" || v === "inactive") return "inactive"
  return raw.trim()
}

export function mapEntenteRow(row: SheetRow): Entente {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_entente"),
    numeroOrdre: str(row, "numero_ordre_entente"),
    nom: str(row, "nom_entente"),
    pseudo: str(row, "pseudo_entente"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    personneContactId: str(row, "id_personne_contact"),
    personneContactNom: str(row, "nom_personne_contact"),
    personneContactTelephone: str(row, "telephone_personne_contact"),
    presidentId: str(row, "id_president_entente") || str(row, "id_personne_contact"),
    presidentNom: str(row, "nom_president_entente") || str(row, "nom_personne_contact"),
    presidentTelephone: str(row, "telephone_president_entente") || str(row, "telephone_personne_contact"),
    presidentEmail: str(row, "email_president_entente"),
    secretaireId: str(row, "id_secretaire_entente"),
    secretaireNom: str(row, "nom_secretaire_entente"),
    secretaireTelephone: str(row, "telephone_secretaire_entente"),
    secretaireEmail: str(row, "email_secretaire_entente"),
    statut: normalizeStatut(statutRaw),
  }
}
