import "server-only"

import { env } from "@/lib/env"
import { getSheetDataFrom } from "@/lib/google-sheets"
import { compareLabels } from "@/lib/sort-utils"

export type ActorSexOption = { id: string; nom: string }
export type TransferTypeOption = { id: string; nom: string }

export async function getActorSexes(): Promise<ActorSexOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "ACTEURS_SEXE!A:C")
  const unique = new Map<string, ActorSexOption>()
  for (const row of rows) {
    const nom = String(row.nom ?? "").trim()
    if (!nom) continue
    const key = nom.toLowerCase()
    if (!unique.has(key)) {
      unique.set(key, { id: String(row.id_sexe ?? "").trim() || `ACTEURS_SEXE:${nom}`, nom })
    }
  }
  return Array.from(unique.values()).sort((a, b) => compareLabels(a.nom, b.nom))
}

export async function getTransferTypes(): Promise<TransferTypeOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "TYPES_TRANSFERT!A:C")
  const unique = new Map<string, TransferTypeOption>()
  for (const row of rows) {
    const nom = String(row.nom_type_transfert ?? row.nom_transfert ?? row.nom ?? "").trim()
    if (!nom) continue
    const key = nom.toLowerCase()
    if (!unique.has(key)) {
      unique.set(key, {
        id: String(row.id_type_transfert ?? row.id_transfert ?? row.id ?? "").trim() || `TYPES_TRANSFERT:${nom}`,
        nom,
      })
    }
  }
  return Array.from(unique.values()).sort((a, b) => compareLabels(a.nom, b.nom))
}
