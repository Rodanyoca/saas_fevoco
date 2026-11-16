import "server-only"

import { env } from "@/lib/env"
import { getSheetDataFrom, type SheetRow } from "@/lib/google-sheets"
import { affiliationSheets, readAffiliationRow } from "@/lib/actor-affiliation-schema"
import { mapAthleteLicence, mapLicence } from "@/lib/mappers/actor-records"
import { actorLicenceKinds } from "@/lib/actor-licences-model"
import { calculateLicenceMetrics, isMetricActive, isMetricDone, normalizeMetricValue } from "@/lib/dashboard-metrics"

const text = (value: unknown) => String(value ?? "").trim()
const kinds = ["athlete", "coach", "arbitre", "medecin", "officiel"] as const
const labels = ["Athlètes", "Entraîneurs", "Arbitres", "Médecins", "Officiels"]
const actorTypes = new Map(Object.entries(actorLicenceKinds).map(([id, config]) => [id, config.kind]))

// These reads retain the existing Sheets cache, tags and automatic batching.
// A failed source stays independent, as with the dashboard's previous safe getters.
async function read(book: string, range: string): Promise<SheetRow[]> {
  try { return await getSheetDataFrom(book, range) } catch { return [] }
}

export async function loadDashboardRecords() {
  const config = env.googleSheets
  const affiliationKinds = ["athlete", "coach", "medecin", "officiel"] as const
  const [statuses, licenceStatuses, seasons, athleteRows, actorRows, affiliationGroups] = await Promise.all([
    read(config.referentielsSpreadsheetId, "STATUTS_AFFILIATION!A:ZZ"),
    read(config.referentielsSpreadsheetId, "STATUT_LICENCE!A:ZZ"),
    read(config.referentielsSpreadsheetId, "SAISON!A:ZZ"),
    read(config.licencesSpreadsheetId, "ATHLETE_LICENCES!A:Z"),
    read(config.licencesSpreadsheetId, "ACTEURS_LICENCES!A:Z"),
    Promise.all(affiliationKinds.map(kind => read(config.affiliationsSpreadsheetId, `${affiliationSheets[kind].sheet}!A:ZZ`))),
  ])
  const statusOptions = statuses.map(row => ({ id: text(row.id_statut_affiliation), label: text(row.nom_statut_affiliation) })).filter(item => item.id && item.label)
  const affiliationLabels = new Map(statusOptions.map(item => [item.id, item.label]))
  const affiliations = { total: 0, active: 0, inactive: 0 }
  for (let index = 0; index < affiliationKinds.length; index++) {
    for (const raw of affiliationGroups[index]) {
      // Reuse the canonical identifier/status aliases; dates and entity labels are not displayed.
      const row = readAffiliationRow(affiliationKinds[index], raw, statusOptions, value => value)
      if (!row.id || !row.actorId) continue
      const status = affiliationLabels.get(row.statusId) || "Statut inconnu"
      affiliations.total++
      if (isMetricActive(status)) affiliations.active++
      if (isMetricDone(status) || normalizeMetricValue(status).includes("inactif")) affiliations.inactive++
    }
  }
  const statusLabels = new Map(licenceStatuses.map(row => [text(row.id_statut_licence), text(row.nom_statut_licence)]))
  const seasonsById = new Map(seasons.map(row => [text(row.id_saison), row]))
  const groups = new Map(kinds.map(kind => [kind, [] as ReturnType<typeof mapLicence>[]]))
  for (const raw of athleteRows) {
    const licence = mapAthleteLicence(raw, seasonsById.get(text(raw.id_saison ?? raw.saison)))
    if (licence.idLicence && licence.actorId) groups.get("athlete")!.push(licence)
  }
  for (const raw of actorRows) {
    const kind = actorTypes.get(text(raw.id_type_acteur))
    if (!kind) continue
    const licence = mapLicence(raw, kind)
    if (licence.idLicence && licence.actorId) groups.get(kind)!.push(licence)
  }
  const now = Date.now()
  const licenceRows = kinds.map((kind, index) => {
    const rows = groups.get(kind)!
    for (const row of rows) row.statutLicence = statusLabels.get(row.idStatutLicence || "") || row.statutLicence
    return { label: labels[index], ...calculateLicenceMetrics(rows, now) }
  })
  return { affiliations, licenceRows, totalLicences: licenceRows.reduce((sum, row) => sum + row.total, 0) }
}
