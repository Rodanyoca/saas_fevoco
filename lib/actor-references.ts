import "server-only"

import { env } from "@/lib/env"
import { getSheetDataFrom } from "@/lib/google-sheets"
import { compareLabels } from "@/lib/sort-utils"

export type ActorSexOption = { id: string; nom: string }
export type TransferTypeOption = { id: string; nom: string }
export type CoachReferenceOption = { id: string; nom: string }

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

async function referenceOptions(sheetNames: string[], idKeys: string[], nameKeys: string[]): Promise<CoachReferenceOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  let rows: Record<string, unknown>[] = []
  for (const sheetName of sheetNames) {
    rows = await getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, `${sheetName}!A:C`)
    if (rows.length) break
  }
  const unique = new Map<string, CoachReferenceOption>()
  for (const row of rows) {
    const nom = nameKeys.map((key) => String(row[key] ?? "").trim()).find(Boolean) ?? ""
    if (!nom) continue
    const key = nom.toLowerCase()
    const id = idKeys.map((idKey) => String(row[idKey] ?? "").trim()).find(Boolean) ?? ""
    if (!unique.has(key)) unique.set(key, { id: id || `${sheetNames[0]}:${nom}`, nom })
  }
  return Array.from(unique.values()).sort((a, b) => compareLabels(a.nom, b.nom))
}

export const getActorAffiliationTypes = () =>
  referenceOptions(
    ["TYPES_AFFILIATIONS_ACTEURS"],
    ["id_type", "id_type_affiliation", "id"],
    ["nom_type", "nom_type_affiliation", "nom"],
  )

export const getMedecinSpecialties = () =>
  referenceOptions(
    ["SPECIALITE_MEDECIN"],
    ["id_specialite", "id"],
    ["nom_specialite", "specialite", "nom"],
  )

export const getCoachFunctions = () =>
  referenceOptions(
    ["FONCTION_COACH"],
    ["id_fonction_coach", "id_fonction", "id"],
    ["nom_fonction_coach", "nom_fonction", "fonction", "nom"],
  )

export const getOfficialFunctions = () =>
  referenceOptions(
    ["FONCTION_OFFICIEL"],
    ["id_fonction", "id"],
    ["nom_fonction", "fonction", "nom"],
  )
