import type { SheetRow } from "@/lib/google-sheets"
import type { MedecinAffiliation } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active" || v === "en cours") return "actif"
  if (v === "inactif" || v === "inactive" || v === "termine" || v === "terminé") return "inactif"
  return raw.trim()
}

export function mapMedecinAffiliationRow(row: SheetRow): MedecinAffiliation {
  return {
    medecinId: str(row, "id_medecin"),
    medecinNom: str(row, "nom_complet"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    ententeId: str(row, "id_entente"),
    ententeNom: str(row, "nom_entente"),
    pseudoEntente: str(row, "pseudo_entente"),
    clubId: str(row, "id_club"),
    clubNom: str(row, "nom_club"),
    dateDebut: str(row, "date_de_debut"),
    dateFin: str(row, "date_de_fin"),
    statut: normalizeStatut(str(row, "statut")),
  }
}
