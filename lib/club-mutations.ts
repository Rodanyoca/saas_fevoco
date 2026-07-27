import "server-only"

import { env } from "@/lib/env"
import { getClubs, getEntentes } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { getClubCategories, getClubVersions } from "@/lib/club-references"
import { assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const statuses = new Set(["actif", "inactif", "active", "inactive"])
const buildClubId = (idEntente: string, codeClub: string) => `${idEntente}${codeClub}`

type ClubInput = {
  codeClub: string
  nomClub: string
  categorie: string
  version: string
  dateAffiliationClub: string
  idEntente: string
  statut: string
  observations: string
}

function normalizeInput(payload: Record<string, unknown>): ClubInput {
  return {
    codeClub: text(payload.codeClub),
    nomClub: text(payload.nomClub),
    categorie: text(payload.categorie),
    version: text(payload.version),
    dateAffiliationClub: text(payload.dateAffiliationClub),
    idEntente: text(payload.idEntente),
    statut: text(payload.statut).toLowerCase(),
    observations: text(payload.observations),
  }
}

function validateInput(input: ClubInput, editing: boolean) {
  if (!editing && !input.codeClub) throw new Error("Le code du club est obligatoire.")
  if (!input.nomClub) throw new Error("Le nom du club est obligatoire.")
  if (!input.idEntente) throw new Error("L’entente est obligatoire.")
  assertValidDate(input.dateAffiliationClub, "La date d’affiliation du club")
  if (!statuses.has(input.statut)) throw new Error("Le statut du club est invalide.")
}

function validateReferences(
  input: ClubInput,
  categories: Array<{ nom: string }>,
  versions: Array<{ nom: string }>,
) {
  if (categories.length && input.categorie && !categories.some((option) => option.nom === input.categorie)) {
    throw new Error("La catégorie sélectionnée est invalide.")
  }
  if (versions.length && input.version && !versions.some((option) => option.nom === input.version)) {
    throw new Error("La version sélectionnée est invalide.")
  }
}

function clubResult(idClub: string, input: ClubInput, entente: {
  idEntente: string
  nomEntente: string
  pseudoEntente: string
  idLigue: string
  nomLigue: string
}, previousIdClub?: string) {
  return {
    idClub,
    previousIdClub,
    codeClub: input.codeClub,
    nomClub: input.nomClub,
    categorie: input.categorie,
    version: input.version,
    dateAffiliationClub: input.dateAffiliationClub,
    idEntente: entente.idEntente,
    nomEntente: entente.nomEntente,
    pseudoEntente: entente.pseudoEntente,
    idLigue: entente.idLigue,
    nomLigue: entente.nomLigue,
    statut: input.statut,
    observations: input.observations,
  }
}

export async function createClub(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  validateInput(input, false)
  const [clubs, ententes, categories, versions] = await Promise.all([
    getClubs(), getEntentes(), getClubCategories(), getClubVersions(),
  ])
  validateReferences(input, categories, versions)
  const entente = ententes.find((item) => item.idEntente === input.idEntente)
  if (!entente) throw new Error("Entente introuvable.")
  const idClub = buildClubId(entente.idEntente, input.codeClub)
  if (clubs.some((club) => club.idClub === idClub)) throw new Error("Cet identifiant de club existe déjà.")
  if (clubs.some((club) => club.idEntente === input.idEntente && club.codeClub === input.codeClub)) {
    throw new Error("Ce code de club existe déjà dans cette entente.")
  }
  if (clubs.some((club) => club.idEntente === input.idEntente && club.nomClub.toLowerCase() === input.nomClub.toLowerCase())) {
    throw new Error("Un club portant ce nom existe déjà dans cette entente.")
  }
  await appendSheetRecord(env.googleSheets.territorialSpreadsheetId, "CLUBS", {
    id_club: idClub, code_club: input.codeClub, nom_club: input.nomClub,
    categorie: input.categorie, version: input.version,
    date_affiliation_club: input.dateAffiliationClub,
    id_entente: entente.idEntente, nom_entente: entente.nomEntente,
    pseudo_entente: entente.pseudoEntente,
    id_ligue: entente.idLigue, nom_ligue: entente.nomLigue,
    statut: input.statut, observations: input.observations,
  })
  return (await getClubs()).find((club) => club.idClub === idClub)
    ?? clubResult(idClub, input, entente)
}

export async function updateClub(idClub: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const [clubs, ententes, categories, versions] = await Promise.all([
    getClubs(), getEntentes(), getClubCategories(), getClubVersions(),
  ])
  const current = clubs.find((club) => club.idClub === idClub)
  if (!current) throw new Error("Club introuvable.")
  input.codeClub = current.codeClub
  validateInput(input, true)
  validateReferences(input, categories, versions)
  if (!input.codeClub) throw new Error("Le code du club est introuvable.")
  const entente = ententes.find((item) => item.idEntente === input.idEntente)
  if (!entente) throw new Error("Entente introuvable.")
  const nextIdClub = buildClubId(entente.idEntente, input.codeClub)
  if (clubs.some((club) => club.idClub !== idClub && club.idClub === nextIdClub)) {
    throw new Error("Cet identifiant de club existe déjà.")
  }
  if (clubs.some((club) =>
    club.idClub !== idClub &&
    club.idEntente === input.idEntente &&
    club.nomClub.toLowerCase() === input.nomClub.toLowerCase()
  )) {
    throw new Error("Un club portant ce nom existe déjà dans cette entente.")
  }
  await updateSheetRecordById(env.googleSheets.territorialSpreadsheetId, "CLUBS", "id_club", idClub, {
    id_club: nextIdClub, nom_club: input.nomClub,
    categorie: input.categorie, version: input.version,
    date_affiliation_club: input.dateAffiliationClub,
    id_entente: entente.idEntente, nom_entente: entente.nomEntente,
    pseudo_entente: entente.pseudoEntente,
    id_ligue: entente.idLigue, nom_ligue: entente.nomLigue,
    statut: input.statut, observations: input.observations,
  })
  const saved = (await getClubs()).find((club) => club.idClub === nextIdClub)
  return saved ? { ...saved, previousIdClub: idClub } : clubResult(nextIdClub, input, entente, idClub)
}
