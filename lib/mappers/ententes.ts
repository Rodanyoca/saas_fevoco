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
    idEntente: str(row, "id_entente"),
    codeEntente: str(row, "code_entente"),
    nomEntente: str(row, "nom_entente"),
    pseudoEntente: str(row, "pseudo_entente"),
    idLigue: str(row, "id_ligue"),
    nomLigue: str(row, "nom_ligue"),
    emailEntente: str(row, "email_entente"),
    observations: str(row, "observations"),
    id: str(row, "id_entente"),
    numeroOrdre: str(row, "code_entente") || str(row, "numero_ordre_entente"),
    nom: str(row, "nom_entente"),
    pseudo: str(row, "pseudo_entente"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    statut: normalizeStatut(statutRaw),
  }
}
