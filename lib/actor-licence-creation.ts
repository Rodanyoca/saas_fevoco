import "server-only"
import { env } from "@/lib/env"
import { appendSheetRecord, formatSheetDateColumns, getSheetDataFrom, getSheetsDataFrom, updateSheetRecordById } from "@/lib/google-sheets"
import { createLicenceDomain, type LicenceStore } from "@/lib/licences-domain"
import { actorLicenceKinds, buildActorLicenceData, licenceReadDate, licenceText, type ActorLicenceSources } from "@/lib/actor-licences-model"

const config = env.googleSheets
export const licenceToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
async function sources(fresh = false): Promise<ActorLicenceSources> {
  if (![config.licencesSpreadsheetId, config.acteursSpreadsheetId, config.affiliationsSpreadsheetId, config.territorialSpreadsheetId, config.referentielsSpreadsheetId, config.clientEmail, config.privateKey].every(Boolean)) throw new Error("Les sources des licences, acteurs, affiliations et référentiels ne sont pas configurées.")
  const [licences, actors, affiliations, structures, refs] = await Promise.all([
    getSheetDataFrom(config.licencesSpreadsheetId, "ACTEURS_LICENCES!A:ZZ", { fresh }),
    getSheetsDataFrom(config.acteursSpreadsheetId, ["COACHS", "OFFICIELS", "ARBITRES", "MEDECINS"].map(name => `${name}!A:ZZ`)),
    getSheetsDataFrom(config.affiliationsSpreadsheetId, ["COACH_AFFILIATIONS", "OFFICIELS_AFFILIATIONS", "MEDECIN_AFFILIATIONS"].map(name => `${name}!A:ZZ`)),
    getSheetsDataFrom(config.territorialSpreadsheetId, ["CLUBS", "ENTENTES", "LIGUES"].map(name => `${name}!A:ZZ`)),
    getSheetsDataFrom(config.referentielsSpreadsheetId, ["TYPES_ACTEURS", "CYCLES_LICENCES", "STATUT_LICENCE", "STATUTS_AFFILIATION", "TYPES_STRUCTURES", "FEDERATION"].map(name => `${name}!A:ZZ`)),
  ])
  return { licences, actors, affiliations, structures: { ...structures, FEDERATION: refs.FEDERATION || [] }, refs }
}
export async function actorLicencePageData() { return buildActorLicenceData(await sources(), licenceToday()) }
const stringRows = (rows: Record<string, unknown>[]) => rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, licenceText(value)])))
let pending: Promise<unknown> = Promise.resolve()
function mutate<T>(run: (store: LicenceStore) => Promise<T>) {
  const task = pending.catch(() => {}).then(async () => {
    const data = await sources(true), { references } = buildActorLicenceData(data, licenceToday())
    const store: LicenceStore = {
      async load() { return { athleteLicences: [], actorLicences: stringRows(data.licences).map(row => ({ ...row, date_delivrance: licenceReadDate(row.date_delivrance), date_debut_validite: licenceReadDate(row.date_debut_validite), date_fin_validite: licenceReadDate(row.date_fin_validite) })) } },
      async appendActor(row) {
        await formatSheetDateColumns(config.licencesSpreadsheetId, "ACTEURS_LICENCES", ["date_delivrance", "date_debut_validite", "date_fin_validite"], "yyyy-mm-dd")
        await appendSheetRecord(config.licencesSpreadsheetId, "ACTEURS_LICENCES", row)
      },
      async updateActor(id, row) {
        await formatSheetDateColumns(config.licencesSpreadsheetId, "ACTEURS_LICENCES", ["date_delivrance", "date_debut_validite", "date_fin_validite"], "yyyy-mm-dd")
        await updateSheetRecordById(config.licencesSpreadsheetId, "ACTEURS_LICENCES", "id_licence", id, row)
      },
      async appendAthlete() { throw new Error("Utilisez le parcours des licences d’athlètes.") },
      async athleteExists() { return false }, async seasonExists() { return false },
      async actorExists(typeId, id) { return references.actors.some(row => row.typeId === typeId && row.id === id) },
      async cycleExists(id) { return references.cycles.some(row => row.id === id) },
      async statusExists(id) { return references.statuses.some(row => row.id === id) },
      async affiliation(kind, id) {
        const typeId = Object.entries(actorLicenceKinds).find(([, config]) => config.kind === kind)?.[0]
        const row = references.affiliations.find(item => item.typeId === typeId && item.id === id)
        return row ? { id: row.id, actorId: row.actorId, activeFrom: row.dateDebut || "9999-12-31", activeUntil: row.dateFin, statusId: row.statusId, targetExists: row.targetExists } : null
      },
    }
    return run(store)
  })
  pending = task
  return task
}
export const createActorLicence = (input: unknown) => mutate(store => createLicenceDomain(store).createActor(input))
export const updateActorLicence = (id: string, input: unknown) => mutate(store => createLicenceDomain(store).updateActor(id, input))
export const transitionActorLicence = (id: string, action: string) => mutate(store => createLicenceDomain(store).transitionActor(id, action, licenceToday()))
