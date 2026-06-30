import type { Ligue } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return (v === null || v === undefined) ? "" : String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "active"
  if (v === "inactif" || v === "inactive") return "inactive"
  return raw.trim()
}

function num(row: SheetRow, key: string): number | undefined {
  const v = row[key]
  if (v === null || v === undefined || v === "") return undefined
  const n = typeof v === "number" ? v : Number(String(v))
  if (Number.isNaN(n)) return undefined
  return n
}

export function mapLigueRow(row: SheetRow): Ligue {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    id: str(row, "id_ligue"),
    nom: str(row, "nom_ligue"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    emailLigue: str(row, "email_ligue"),
    presidentId: str(row, "id_president_ligue"),
    presidentNom: str(row, "nom_president_ligue"),
    presidentTelephone: str(row, "telephone_president_ligue"),
    presidentEmail: str(row, "email_president_ligue"),
    secretaireId: str(row, "id_secretaire_ligue"),
    secretaireNom: str(row, "nom_secretaire_ligue"),
    secretaireTelephone: str(row, "telephone_secretaire_ligue"),
    secretaireEmail: str(row, "email_secretaire_ligue"),
    statut: normalizeStatut(statutRaw),

    ententes: num(row, "ententes"),
    clubs: num(row, "clubs"),
    athletes: num(row, "athletes"),
  }
}
