// Offline CPU microbenchmark. Synthetic records never reach the application or Sheets.
const assert = require('node:assert/strict')
const { performance } = require('node:perf_hooks')
const { harness } = require('../tests/helpers/dashboard-harness.cjs')
const metrics = harness().load('lib/dashboard-metrics.ts')
const rows = Array.from({ length: 50000 }, (_, id) => ({
  genre: id % 2 ? 'Masculin' : 'Feminin', statut: id % 3 ? 'ACTIF' : 'INACTIF',
  statutLicence: id % 3 ? 'ACTIF' : 'INACTIF', dateFinValidite: id % 4 ? '2099-12-31' : '2000-01-01',
  id, date: String((id * 37) % 10007),
}))
const oldActors = () => {
  const men = rows.filter(row => ['m', 'masculin', 'homme'].includes(metrics.normalizeMetricValue(row.genre))).length
  const women = rows.filter(row => ['f', 'feminin', 'femme'].includes(metrics.normalizeMetricValue(row.genre))).length
  const active = rows.filter(row => metrics.isMetricActive(row.statut)).length
  return { total: rows.length, men, women, active, inactive: rows.length - active }
}
const oldLicences = () => ({ total: rows.length,
  active: rows.filter(row => metrics.isMetricActive(row.statutLicence) && !metrics.isDateExpired(row.dateFinValidite)).length,
  expired: rows.filter(row => metrics.isDateExpired(row.dateFinValidite)).length,
})
const oldRecent = () => [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
function measure(fn) {
  for (let i = 0; i < 3; i++) fn()
  const cpu = process.cpuUsage(), start = performance.now()
  for (let i = 0; i < 12; i++) fn()
  const consumed = process.cpuUsage(cpu)
  return { elapsedMs: +(performance.now() - start).toFixed(2), cpuMs: +((consumed.user + consumed.system) / 1000).toFixed(2) }
}
const comparisons = [
  ['actors', oldActors, () => metrics.summarizeDashboardActors(rows)],
  ['licences', oldLicences, () => metrics.calculateLicenceMetrics(rows)],
  ['recent', oldRecent, () => metrics.latestDashboardRows(rows, row => row.date)],
]
const results = comparisons.map(([name, before, after]) => {
  assert.equal(JSON.stringify(after()), JSON.stringify(before()), `${name}: equivalent results`)
  return { name, before: measure(before), after: measure(after) }
})
console.log(JSON.stringify({ node: process.version, records: rows.length, iterations: 12, warmups: 3, scope: 'isolated aggregations, no network or React rendering', results }, null, 2))
