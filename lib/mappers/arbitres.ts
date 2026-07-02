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
    id: str(row, "id_arbitre"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_de_naissance"),
    genre: str(row, "genre"),
    grade: str(row, "grade"),
    provinceId: "",
    provinceNom: "",
    ligueId: "",
    ligueNom: "",
    ententeId: "",
    ententeNom: "",
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    dateHomologation: str(row, "date_homologation"),
    equipeNational: str(row, "equipe_national"),
    experience: "",
    statut: normalizeStatut(statutRaw),
  }
}
