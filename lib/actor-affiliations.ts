import "server-only"
import { randomUUID } from "node:crypto"
import { env } from "@/lib/env"
import { appendSheetRecord, formatSheetDateColumns, getSheetDataFrom, getSheetsDataFrom, updateSheetRecordById, type SheetRow } from "@/lib/google-sheets"
import { formatDateForSheet } from "@/lib/compact-date"
import { AffiliationDomainError, createAffiliationDomain, type AffiliationKind, type AffiliationStore } from "@/lib/affiliations-domain"
import { affiliationSheets, affiliationView, readAffiliationRow, writeAffiliationRow, type AffiliationReferences } from "@/lib/actor-affiliation-schema"

const text = (value: unknown) => String(value ?? "").trim()
const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
const options = (rows: SheetRow[], id: string, label: string) => rows.map(row => ({ id: text(row[id]), label: text(row[label]) })).filter(item => item.id && item.label)

async function context(kind: AffiliationKind) {
  const config = env.googleSheets, definition = affiliationSheets[kind]
  if (!config.affiliationsSpreadsheetId || !config.acteursSpreadsheetId || !config.territorialSpreadsheetId || !config.referentielsSpreadsheetId || !config.clientEmail || !config.privateKey) throw new AffiliationDomainError("SOURCE_INDISPONIBLE", "Les classeurs des affiliations ne sont pas configurés.", 503)
  const entity = kind === "officiel" || kind === "autre"
  const [reference, territory, actors] = await Promise.all([
    getSheetsDataFrom(config.referentielsSpreadsheetId, ["STATUTS_AFFILIATION", ...(entity ? ["TYPES_STRUCTURES", "FEDERATION"] : []), ...(kind === "officiel" ? ["FONCTION_OFFICIEL"] : []), ...(kind === "autre" ? ["SAISON"] : [])].map(name => `${name}!A:ZZ`)),
    getSheetsDataFrom(config.territorialSpreadsheetId, (entity ? ["CLUBS", "LIGUES", "ENTENTES"] : ["CLUBS"]).map(name => `${name}!A:ZZ`)),
    getSheetDataFrom(config.acteursSpreadsheetId, `${definition.actorSheet}!A:ZZ`),
  ])
  const clubs = options(territory.CLUBS || [], "id_club", "nom_club")
  const entitySources = { FEDERATION: options(reference.FEDERATION || [], "id_federation", "nom_officiel"), LIGUE: options(territory.LIGUES || [], "id_ligue", "nom_ligue"), ENTENTE: options(territory.ENTENTES || [], "id_entente", "nom_entente"), CLUB: clubs }
  const entityTypes = options(reference.TYPES_STRUCTURES || [], "id_type_structure", "nom_type_structure").filter(item => Object.hasOwn(entitySources, normalized(item.label)))
  const refs: AffiliationReferences = { clubs, statuses: options(reference.STATUTS_AFFILIATION || [], "id_statut_affiliation", "nom_statut_affiliation"), functions: options(reference.FONCTION_OFFICIEL || [], "id_fonction", "nom_fonction"), seasons: options(reference.SAISON || [], "id_saison", "nom_saison"), entityTypes, entities: Object.fromEntries(entityTypes.map(item => [item.id, entitySources[normalized(item.label) as keyof typeof entitySources]])) }
  const store: AffiliationStore = {
    async list(_kind, fresh = false) { return (await getSheetDataFrom(config.affiliationsSpreadsheetId, `${definition.sheet}!A:ZZ`, { fresh })).map(row => readAffiliationRow(kind, row, refs.statuses, formatDateForSheet)).filter(row => row.id && row.actorId) },
    actorExists: async (_kind, id) => actors.some(row => text(row[definition.actor]) === id),
    clubExists: async id => clubs.some(item => item.id === id),
    entityExists: async (type, id) => Boolean(refs.entities[type]?.some(item => item.id === id)),
    statusExists: async id => refs.statuses.some(item => item.id === id),
    statusLabel: async id => refs.statuses.find(item => item.id === id)?.label || "",
    officialFunctionExists: async id => refs.functions.some(item => item.id === id),
    seasonExists: async id => refs.seasons.some(item => item.id === id),
    generateId: () => `${definition.prefix}-${randomUUID()}`,
    async save(row, mode) {
      await formatSheetDateColumns(config.affiliationsSpreadsheetId, definition.sheet, ["date_debut", "date_fin"], "yyyy-mm-dd")
      const record = writeAffiliationRow(row, await store.statusLabel(row.statusId))
      if (mode === "create") await appendSheetRecord(config.affiliationsSpreadsheetId, definition.sheet, record)
      else await updateSheetRecordById(config.affiliationsSpreadsheetId, definition.sheet, definition.id, row.id, record)
    },
  }
  const names = new Map(actors.map(row => [text(row[definition.actor]), text(row.nom_complet)]))
  return { refs, store, actorName: (id: string) => names.get(id) || "" }
}

export async function listActorAffiliations(kind: AffiliationKind, actorId: string) {
  const { refs, store } = await context(kind)
  if (!actorId || !(await store.actorExists(kind, actorId))) throw new AffiliationDomainError("ACTEUR_INTROUVABLE", "Acteur introuvable.", 404)
  const rows = (await store.list(kind)).filter(row => row.actorId === actorId).sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
  return { affiliations: rows.map(row => affiliationView(row, refs)), references: refs }
}

export async function allActorAffiliationViews(kind: AffiliationKind) {
  const { refs, store, actorName } = await context(kind)
  return (await store.list(kind)).map(row => ({ ...affiliationView(row, refs), actorName: actorName(row.actorId) }))
}

// Sérialise les écritures dans une instance ; les UUID évitent les collisions entre instances.
const pending = new Map<string, Promise<unknown>>()
export async function saveActorAffiliation(kind: AffiliationKind, actorId: string, input: unknown, id?: string) {
  const key = `${kind}:${actorId}`, previous = pending.get(key) || Promise.resolve()
  const task = previous.catch(() => {}).then(async () => {
    const { refs, store } = await context(kind), domain = createAffiliationDomain(store)
    const result = id ? await domain.update(kind, actorId, id, input) : await domain.create(kind, actorId, input)
    return { affiliation: affiliationView(result.row, refs), created: result.created }
  })
  pending.set(key, task)
  try { return await task } finally { if (pending.get(key) === task) pending.delete(key) }
}
