// Synthetic records for offline measurement only; no Sheets writes or network.
const assert = require('node:assert/strict')
const { performance } = require('node:perf_hooks')
const vm = require('node:vm')
const { harness } = require('../tests/helpers/dashboard-harness.cjs')

function measure(fn) {
  for (let i = 0; i < 3; i++) fn()
  const start = performance.now(), cpu = process.cpuUsage()
  for (let i = 0; i < 200; i++) fn()
  const used = process.cpuUsage(cpu)
  return { cpuMs: +((used.user + used.system) / 1000).toFixed(2), elapsedMs: +(performance.now() - start).toFixed(2) }
}
async function main() {
  const raw = Array.from({ length: 10000 }, (_, i) => ({
    id_athlete: `TEST-${i}`, nom_complet: `Personne de test ${i}`, id_club: `TEST-CLUB-${i % 100}`,
    telephone: 'TEST-CONTACT', email: 'test@example.invalid', statut: 'ACTIF', id_sexe: 'S1',
  }))
  const h = harness({ ATHLETES: raw, SEXES: [{ id_sexe: 'S1', nom_sexe: 'Masculin' }] })
  const data = h.load('lib/data.ts')
  const before = await data.getAthletes()
  const beforeReads = h.reads.length
  h.reads.length = 0
  const after = await data.getAthleteTerritorialLinks()
  const afterReads = h.reads.length
  assert.equal(JSON.stringify(after), JSON.stringify(before.map(({ idAthlete, clubId }) => ({ idAthlete, clubId }))))
  const bytes = value => Buffer.byteLength(JSON.stringify(value), 'utf8')
  const { filterDataTableRows } = h.load('lib/data-table-filter.ts')
  // Both filter callbacks run in a VM realm, matching the test harness loader.
  const previousFilter = vm.runInNewContext(`(rows) => rows.filter(item => {
    const searchMatch = Object.values(item).some(value => String(value).toLowerCase().includes(''.toLowerCase()))
    if (!searchMatch) return false
    for (const [key, value] of Object.entries({})) {
      if (value && value !== 'all' && String(item[key]) !== value) return false
    }
    return true
  })`)
  const oldFilter = () => previousFilter(before)
  const newFilter = () => filterDataTableRows(before, '', {})
  assert.equal(JSON.stringify(oldFilter()), JSON.stringify(newFilter()))
  console.log(JSON.stringify({
    node: process.version, records: raw.length, iterations: 200, warmups: 3,
    scope: 'isolated JSON serialization and initial blank filtering; no HTTP/RSC/browser rendering',
    athleteReaderLogicalRanges: { before: beforeReads, after: afterReads },
    athleteJsonBytes: { before: bytes(before), after: bytes(after) },
    serialization: { before: measure(() => JSON.stringify(before)), after: measure(() => JSON.stringify(after)) },
    blankFiltering: { before: measure(oldFilter), after: measure(newFilter) },
  }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
