/* eslint-disable @typescript-eslint/no-require-imports -- Read-only, targeted technical audit. */
/* global require, process, console */
const path = require("node:path")
require(path.join(process.cwd(), "node_modules/@next/env")).loadEnvConfig(process.cwd(), false, { info() {}, error() {} })
const { google } = require("googleapis")
async function main() {
  const env = process.env, auth = new google.auth.JWT({ email: env.GOOGLE_CLIENT_EMAIL, key: (env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] })
  const api = google.sheets({ version: "v4", auth }), opts = { timeout: 20000, retry: false }
  const config = { affiliations: env.FEVOCO_AFFILIATIONS_SPREADSHEET_ID || env.FEVOCO_AFFILIATIONS_LICENCES_SPREADSHEET_ID, licences: env.FEVOCO_LICENCES_SPREADSHEET_ID, actors: env.FEVOCO_ACTEURS_SPREADSHEET_ID }
  const tables = { affiliations: ["ATHLETE_AFFILIATIONS"], licences: ["ATHLETE_LICENCES", "COMPTEURS_LICENCES"], actors: ["ATHLETES"] }
  const data = await Promise.all(Object.entries(config).map(async ([book, spreadsheetId]) => {
    const [meta, values] = await Promise.all([api.spreadsheets.get({ spreadsheetId, fields: "developerMetadata(metadataId,metadataKey,metadataValue)" }, opts), api.spreadsheets.values.batchGet({ spreadsheetId, ranges: tables[book].map(table => `${table}!A:ZZ`), valueRenderOption: "FORMATTED_VALUE" }, opts)])
    return { book, metadata: meta.data.developerMetadata || [], tables: Object.fromEntries(tables[book].map((table, index) => { const [headers = [], ...rows] = values.data.valueRanges[index].values || []; return [table, { headers, rows: rows.map(row => Object.fromEntries(headers.map((key, i) => [String(key).trim().toLowerCase(), String(row[i] ?? "").trim()]))) }] })) }
  }))
  const actors = new Set(["ATH00584", "ATH00586"]), refs = new Set([...actors, "AFA-000273", "AFA-000274"])
  const parse = item => { try { return JSON.parse(item.metadataValue) } catch { return null } }
  const operations = new Set()
  for (const book of data) for (const item of book.metadata) if ([...refs].some(ref => item.metadataKey.includes(ref) || item.metadataValue?.includes(ref))) { const value = parse(item); if (value?.id) operations.add(value.id); if (item.metadataKey.includes(":receipt:")) operations.add(item.metadataKey.split(":receipt:")[1]) }
  const relevant = data.flatMap(book => book.metadata.filter(item => [...refs, ...operations].some(ref => item.metadataKey.includes(ref) || item.metadataValue?.includes(ref)) || item.metadataKey === "fevoco:business-write:v1").map(item => {
    const value = parse(item)
    return { book: book.book, metadataId: item.metadataId, key: item.metadataKey, ...(value ? { value: Object.fromEntries(["id", "fingerprint", "table", "ids", "context", "operationDate", "target", "operation", "guardOwner"].filter(key => value[key] !== undefined).map(key => [key, value[key]])) } : { owner: item.metadataValue }) }
  }))
  const affiliationRows = data.find(book => book.book === "affiliations").tables.ATHLETE_AFFILIATIONS.rows.filter(row => actors.has(row.id_athlete))
  const licenceRows = data.find(book => book.book === "licences").tables.ATHLETE_LICENCES.rows.filter(row => actors.has(row.id_athlete))
  const select = (row, keys) => Object.fromEntries(keys.map(key => [key, row[key] || ""]))
  const receiptRows = relevant.filter(item => item.value?.table && item.value?.ids).map(item => ({ book: item.book, receipt: item.key, table: item.value.table, rows: item.value.ids.map(id => ({ id, present: (data.find(book => book.book === item.book).tables[item.value.table]?.rows || []).some(row => Object.values(row).includes(id)) })) }))
  if (process.argv.includes("--summary")) { console.log(JSON.stringify({ checkedAt: new Date().toISOString(), writes: 0, receiptRows, activeLocks: relevant.filter(item => item.key.includes(":lock:") || item.key === "fevoco:business-write:v1"), athleteSeasonReservations: relevant.filter(item => item.key.includes(":athlete-season:")), counter: data.find(book => book.book === "licences").tables.COMPTEURS_LICENCES.rows.filter(row => row.id_club === "2705102").map(row => select(row, ["id_club", "id_saison", "dernier_compteur", "statut_compteur"])) }, null, 2)); return }
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), writes: 0, actors: [...actors].map(id => ({ id, exists: data.find(book => book.book === "actors").tables.ATHLETES.rows.some(row => row.id_athlete === id) })), affiliations: affiliationRows.map(row => select(row, ["id_affiliation_athlete", "id_athlete", "id_club", "date_debut", "date_fin", "id_statut_affiliation", "id_type_transfert", "id_affiliation_precedente"])), licences: licenceRows.map(row => select(row, ["id_licence", "id_athlete", "id_affiliation_athlete", "id_saison", "numero_licence", "id_statut_licence", "id_club_attribution", "compteur_saison"])), counters: data.find(book => book.book === "licences").tables.COMPTEURS_LICENCES.rows.filter(row => row.id_club === "2705102").map(row => select(row, ["id_compteur_licence", "id_club", "id_saison", "dernier_compteur", "statut_compteur"])), metadata: relevant }, null, 2))
}
main().catch(error => { console.error(JSON.stringify({ error: "Audit indisponible", code: error.code, status: error.response?.status })); process.exitCode = 1 })
