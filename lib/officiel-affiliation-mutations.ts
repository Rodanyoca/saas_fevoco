import "server-only"

import { env } from "@/lib/env"
import { getOfficielAffiliations } from "@/lib/actor-records"
import { getOfficialFunctions } from "@/lib/actor-references"
import { getClubs, getEntentes, getEquipeNationale, getLigues, getOfficiels } from "@/lib/data"
import { replaceActiveAffiliation } from "@/lib/affiliation-write"
import { assertDateOrder, assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const statuses = new Set(["actif", "inactif", "active", "inactive", "en attente"])

function nextId(existingIds: string[]) {
  const pattern = /^OFF\.AFF-(\d+)$/i
  const max = existingIds.reduce((highest, id) => {
    const match = id.match(pattern)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `OFF.AFF-${String(max + 1).padStart(4, "0")}`
}

export async function createOfficielAffiliation(idOfficiel: string, payload: Record<string, unknown>) {
  const structureKey = text(payload.structureKey)
  const fonction = text(payload.fonction)
  const dateDebut = text(payload.dateDebut)
  const dateFin = text(payload.dateFin)
  const statutAffiliation = text(payload.statutAffiliation).toLowerCase() || "actif"
  const observation = text(payload.observation)
  if (!structureKey) throw new Error("La structure est obligatoire.")
  if (!fonction) throw new Error("La fonction est obligatoire.")
  assertValidDate(dateDebut, "La date de début", true)
  assertValidDate(dateFin, "La date de fin")
  assertDateOrder(dateDebut, dateFin, "La date de fin doit être postérieure à la date de début.")
  if (!statuses.has(statutAffiliation)) throw new Error("Le statut est invalide.")

  const [officiels, clubs, ententes, ligues, equipes, affiliations, functions] = await Promise.all([
    getOfficiels(), getClubs(), getEntentes(), getLigues(), getEquipeNationale(),
    getOfficielAffiliations(), getOfficialFunctions(),
  ])
  const officiel = officiels.find((item) => item.idOfficiel === idOfficiel)
  if (!officiel) throw new Error("Officiel introuvable.")
  const structures = [
    ...ligues.map((item) => ({ key: `ligue:${item.idLigue}`, id: item.idLigue, nom: item.nomLigue })),
    ...ententes.map((item) => ({ key: `entente:${item.idEntente}`, id: item.idEntente, nom: item.nomEntente })),
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub })),
    ...equipes.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale })),
  ]
  const structure = structures.find((item) => item.key === structureKey)
  if (!structure) throw new Error("Structure introuvable.")
  if (functions.length && !functions.some((item) => item.nom === fonction)) throw new Error("La fonction sélectionnée est invalide.")

  const idAffiliation = nextId(affiliations.map((item) => item.idAffiliation))
  const previousAffiliation = affiliations.filter((item) => item.actorId === officiel.idOfficiel).at(-1)
  await replaceActiveAffiliation({
    spreadsheetId: env.googleSheets.affiliationsSpreadsheetId,
    sheetName: "OFFICIELS_AFFILIATIONS",
    previous: previousAffiliation ? {
      id: previousAffiliation.idAffiliation,
      status: previousAffiliation.statutAffiliation,
      endDate: previousAffiliation.dateFin,
      replacementEndDate: dateDebut,
    } : undefined,
    record: {
      id_affiliation: idAffiliation, id_acteur: officiel.idOfficiel, nom_acteur: officiel.nomComplet,
      id_structure: structure.id, nom_structure: structure.nom, fonction,
      date_debut: dateDebut, date_fin: dateFin,
      statut_affiliation: statutAffiliation, observation,
    },
  })
  const saved = (await getOfficielAffiliations()).find((item) => item.idAffiliation === idAffiliation)
  return {
    deactivatedAffiliationId: previousAffiliation?.idAffiliation ?? "",
    affiliation: saved ?? {
      idAffiliation, actorId: officiel.idOfficiel, actorName: officiel.nomComplet,
      idStructure: structure.id, nomStructure: structure.nom, fonction,
      dateDebut, dateFin, statutAffiliation, observation,
    },
  }
}
