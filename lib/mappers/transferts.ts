import type { SheetRow } from "@/lib/google-sheets"
import type { Transfert } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeStatut(raw: string): string {
  const value = raw.trim().toLowerCase()
  if (value === "valide" || value === "validé" || value === "validee" || value === "validée") return "valide"
  if (value === "en attente" || value === "attente") return "en attente"
  if (value === "rejete" || value === "rejeté" || value === "refuse" || value === "refusé") return "rejete"
  return raw.trim()
}

export function mapTransfertRow(row: SheetRow): Transfert {
  return {
    id: str(row, "id_transfert"),
    athleteId: str(row, "id_athlete"),
    athleteNom: str(row, "nom_athlete"),
    clubOrigineId: str(row, "id_club_origine"),
    clubOrigineNom: str(row, "nom_club_origine"),
    clubBeneficiaireId: str(row, "id_club_beneficiaire"),
    clubBeneficiaireNom: str(row, "nom_club_beneficiare") || str(row, "nom_club_beneficiaire"),
    typeTransfert: str(row, "type_de_transfert"),
    duree: str(row, "duree"),
    statut: normalizeStatut(str(row, "statut_transfert")),
    dateValidation: str(row, "date_de_validation"),
    dateDebut: str(row, "date_debut"),
    dateFin: str(row, "date_fin"),
  }
}
