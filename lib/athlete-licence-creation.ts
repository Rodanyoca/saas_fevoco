import "server-only"

import { env } from "@/lib/env"
import { appendSheetRecords, formatSheetDateColumn, getSheetDataFrom, getSheetsDataFrom, updateSheetRecordById, type SheetRow } from "@/lib/google-sheets"
import { createLicenceDomain, type LicenceStore } from "@/lib/licences-domain"
import { athleteAffiliationClubId, athleteAffiliationClubName } from "@/lib/athlete-affiliation-fields"
import { formatDateForSheet } from "@/lib/compact-date"

const clean = (value: unknown) => String(value ?? "").trim()
const first = (row: SheetRow, ...keys: string[]) => keys.map((key) => clean(row[key])).find(Boolean) ?? ""
const civilDate = (value: string) => { try { return formatDateForSheet(value) } catch { return "" } }

async function source() {
  const [licences, affiliations, actors, structures, references] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.licencesSpreadsheetId, ["ATHLETE_LICENCES!A:ZZ", "ACTEURS_LICENCES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.acteursSpreadsheetId, ["ATHLETES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["CLUBS!A:ZZ", "ENTENTES!A:ZZ", "LIGUES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:ZZ", "STATUT_LICENCE!A:ZZ", "STATUTS_AFFILIATION!A:ZZ"]),
  ])
  return { licences, affiliations, actors, structures, references }
}

export type AthleteLicenceCandidate = {
  affiliationId: string
  athleteId: string
  athleteName: string
  clubId: string
  affiliationStatus: string
  dateDebut: string
  dateFin: string
}

export async function athleteLicenceCreationOptions() {
  const data = await source()
  const athletes = new Map((data.actors.ATHLETES ?? []).map((row) => [clean(row.id_athlete), row]))
  const clubs = new Map((data.structures.CLUBS ?? []).map((row) => [clean(row.id_club), row]))
  const ententes = new Map((data.structures.ENTENTES ?? []).map(row => [clean(row.id_entente), row]))
  const ligues = new Map((data.structures.LIGUES ?? []).map(row => [clean(row.id_ligue), row]))
  const affiliationRows = data.affiliations.ATHLETE_AFFILIATIONS ?? []
  const candidates: AthleteLicenceCandidate[] = affiliationRows.flatMap((row) => {
    const affiliationId = first(row, "id_affiliation_athlete", "id_affiliation")
    const athleteId = first(row, "id_athlete", "athlete_id", "id_acteur")
    const clubId = athleteAffiliationClubId(row)
    const athlete = athletes.get(athleteId)
    if (!affiliationId || !athlete || !clubId) return []
    return [{
      affiliationId,
      athleteId,
      athleteName: first(athlete, "nom_complet", "nom_complet_athlete") || athleteId,
      clubId,
      affiliationStatus: first((data.references.STATUTS_AFFILIATION ?? []).find(item => clean(item.id_statut_affiliation) === clean(row.id_statut_affiliation)) || row, "nom_statut_affiliation", "statut_affiliation", "id_statut_affiliation", "statut") || "Non renseigné",
      dateDebut: clean(row.date_debut),
      dateFin: clean(row.date_fin),
    }]
  })
  const historicalClubs = affiliationRows.map((row) => {
    const id = athleteAffiliationClubId(row)
    return { id, label: athleteAffiliationClubName(row) || id }
  }).filter((item) => item.id)
  const clubOptions = new Map([
    ...historicalClubs.map((item) => [item.id, item] as const),
    ...[...clubs.entries()].filter(([id]) => Boolean(id)).map(([id, row]) => [id, { id, label: first(row, "nom_club") || id }] as const),
  ])
  return {
    clubs: [...clubOptions.values()].map(item => {
      const club = clubs.get(item.id), ententeId = clean(club?.id_entente), entente = ententes.get(ententeId), ligueId = clean(entente?.id_ligue)
      return { ...item, ententeId, entente: first(entente || {}, "nom_entente"), ligueId, ligue: first(ligues.get(ligueId) || {}, "nom_ligue") }
    }).sort((a, b) => a.label.localeCompare(b.label, "fr")),
    seasons: (data.references.SAISON ?? []).map((row) => ({ id: clean(row.id_saison), label: first(row, "nom_saison") || clean(row.id_saison) })).filter((item) => item.id),
    statuses: (data.references.STATUT_LICENCE ?? []).map((row) => ({ id: clean(row.id_statut_licence), label: first(row, "nom_statut_licence") || clean(row.id_statut_licence) })).filter((item) => item.id),
    candidates: candidates.sort((a, b) => a.athleteName.localeCompare(b.athleteName, "fr") || b.dateDebut.localeCompare(a.dateDebut)),
  }
}

async function licenceStore() {
  const data = await source()
  const athleteRows = data.actors.ATHLETES ?? []
  const clubIds = new Set((data.structures.CLUBS ?? []).map((row) => clean(row.id_club)).filter(Boolean))
  const affiliationRows = data.affiliations.ATHLETE_AFFILIATIONS ?? []
  const stringRows = (rows: SheetRow[]) => rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, clean(value)])))
  const store: LicenceStore = {
    async load(fresh) { return { athleteLicences: stringRows(fresh ? await getSheetDataFrom(env.googleSheets.licencesSpreadsheetId, "ATHLETE_LICENCES!A:ZZ", { fresh: true }) : data.licences.ATHLETE_LICENCES ?? []), actorLicences: stringRows(data.licences.ACTEURS_LICENCES ?? []) } },
    async updateAthlete(id, row) {
      await formatSheetDateColumn(env.googleSheets.licencesSpreadsheetId, "ATHLETE_LICENCES", "date_delivrance", "yyyy-mm-dd")
      await updateSheetRecordById(env.googleSheets.licencesSpreadsheetId, "ATHLETE_LICENCES", "id_licence", id, row)
    },
    async appendAthlete(rows) {
      await formatSheetDateColumn(env.googleSheets.licencesSpreadsheetId, "ATHLETE_LICENCES", "date_delivrance", "yyyy-mm-dd")
      await appendSheetRecords(env.googleSheets.licencesSpreadsheetId, "ATHLETE_LICENCES", rows)
    },
    async appendActor() { throw new Error("Création de licence acteur hors périmètre.") },
    async athleteExists(id) { return athleteRows.some((row) => clean(row.id_athlete) === id) },
    async actorExists() { return false },
    async seasonExists(id) { return (data.references.SAISON ?? []).some((row) => clean(row.id_saison) === id) },
    async cycleExists() { return false },
    async statusExists(id) { return (data.references.STATUT_LICENCE ?? []).some((row) => clean(row.id_statut_licence) === id) },
    async affiliation(kind, id) {
      if (kind !== "athlete") return null
      const row = affiliationRows.find((item) => first(item, "id_affiliation_athlete", "id_affiliation") === id)
      if (!row) return null
      const clubId = athleteAffiliationClubId(row)
      return {
        id,
        actorId: first(row, "id_athlete", "athlete_id", "id_acteur"),
        activeFrom: civilDate(clean(row.date_debut)) || "9999-12-31",
        activeUntil: clean(row.date_fin) ? civilDate(clean(row.date_fin)) || "0000-01-01" : "",
        statusId: (() => {
          const status = (data.references.STATUTS_AFFILIATION ?? []).find(item => clean(item.id_statut_affiliation) === clean(row.id_statut_affiliation))
          return ["ACTIF", "ACTIVE"].includes(first(status || row, "nom_statut_affiliation", "statut_affiliation", "statut").toUpperCase()) ? "SAF001" : first(row, "id_statut_affiliation", "statut_affiliation", "statut")
        })(),
        targetExists: clubIds.has(clubId),
        clubId,
      }
    },
  }
  return store
}

let pending: Promise<unknown> = Promise.resolve()
async function mutation<T>(run: (store: LicenceStore) => Promise<T>) {
  const task = pending.catch(() => {}).then(async () => run(await licenceStore()))
  pending = task
  return task
}
export const createAthleteLicence = (input: unknown) => mutation(store => createLicenceDomain(store).createAthlete(input, new Date().toISOString().slice(0, 10)))
export const updateAthleteLicence = (id: string, input: unknown) => mutation(store => createLicenceDomain(store).updateAthlete(id, input))
export const renewClubLicences = (input: unknown) => mutation(store => createLicenceDomain(store).renewClub(input))
