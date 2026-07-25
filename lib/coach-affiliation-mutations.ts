import "server-only"

import { env } from "@/lib/env"
import { getCoachAffiliations } from "@/lib/actor-records"
import { getClubs, getCoachs, getEntentes, getLigues } from "@/lib/data"
import { appendSheetRecord } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
const statuses = new Set(["actif", "inactif", "active", "inactive", "en attente"])

function seasonYear(saison: string) {
  const match = saison.match(/\b(20\d{2})\b/)
  if (!match) throw new Error("La saison doit contenir une année, par exemple 2026 ou 2026-2027.")
  return match[1]
}

function nextCoachAffiliationId(existingIds: string[], saison: string) {
  const year = seasonYear(saison)
  const pattern = new RegExp(`^COA\\.AFF-(\\d+)\\/${year}$`, "i")
  const max = existingIds.reduce((highest, id) => {
    const match = id.match(pattern)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `COA.AFF-${String(max + 1).padStart(4, "0")}/${year}`
}

export async function createCoachAffiliation(idCoach: string, payload: Record<string, unknown>) {
  const saison = text(payload.saison)
  const typeAffiliation = text(payload.typeAffiliation)
  const structureKey = text(payload.structureKey)
  const fonction = text(payload.fonction)
  const dateDebut = text(payload.dateDebut)
  const dateFin = text(payload.dateFin)
  const statutAffiliation = text(payload.statutAffiliation).toLowerCase() || "actif"
  const observation = text(payload.observation)

  if (!saison) throw new Error("La saison est obligatoire.")
  seasonYear(saison)
  if (!typeAffiliation) throw new Error("Le type d’affiliation est obligatoire.")
  if (!structureKey) throw new Error("La structure est obligatoire.")
  if (!fonction) throw new Error("La fonction est obligatoire.")
  if (!dateDebut) throw new Error("La date de début est obligatoire.")
  if (dateFin && dateFin < dateDebut) throw new Error("La date de fin doit être postérieure à la date de début.")
  if (!statuses.has(statutAffiliation)) throw new Error("Le statut est invalide.")

  const [coachs, clubs, ententes, ligues, affiliations] = await Promise.all([
    getCoachs(), getClubs(), getEntentes(), getLigues(), getCoachAffiliations(),
  ])
  const coach = coachs.find((item) => item.idCoach === idCoach)
  if (!coach) throw new Error("Coach introuvable.")
  const structures = [
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub })),
    ...ententes.map((item) => ({ key: `entente:${item.idEntente}`, id: item.idEntente, nom: item.nomEntente })),
    ...ligues.map((item) => ({ key: `ligue:${item.idLigue}`, id: item.idLigue, nom: item.nomLigue })),
  ]
  const structure = structures.find((item) => item.key === structureKey)
  if (!structure) throw new Error("Structure introuvable.")
  const idAffiliation = nextCoachAffiliationId(affiliations.map((item) => item.idAffiliation), saison)

  await appendSheetRecord(env.googleSheets.affiliationsSpreadsheetId, "COACH_AFFILIATIONS", {
    id_affiliation: idAffiliation, saison, id_coach: coach.idCoach, nom_coach: coach.nomComplet,
    type_affiliation: typeAffiliation, id_structure: structure.id, nom_structure: structure.nom,
    fonction, date_debut: dateDebut, date_fin: dateFin,
    statut_affiliation: statutAffiliation, observation,
  })
  return {
    idAffiliation, saison, actorId: coach.idCoach, actorName: coach.nomComplet,
    typeAffiliation, idStructure: structure.id, nomStructure: structure.nom,
    fonction, dateDebut, dateFin, statutAffiliation, observation,
  }
}
