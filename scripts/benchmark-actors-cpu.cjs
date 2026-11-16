// Offline synthetic benchmark: no user data, network or Sheets writes.
const assert = require('node:assert/strict')
const { performance } = require('node:perf_hooks')
const { execFileSync } = require('node:child_process')
const vm = require('node:vm')
const { harness } = require('../tests/helpers/dashboard-harness.cjs')
const { actorLicenceFixture } = require('../tests/helpers/actors-cpu-fixtures.cjs')

const oldPath = 'lib/actor-licences-model.ts'
const baseline = process.argv[2] || 'HEAD'
const oldSource = execFileSync('git', ['show', `${baseline}:${oldPath}`], { encoding: 'utf8' })
const previous = harness({}, new Set(), { [oldPath]: oldSource }).load(oldPath)
const current = harness().load(oldPath)
const data = actorLicenceFixture(2000)
const beforeLicence = () => previous.buildActorLicenceData(data, '2026-11-16')
const afterLicence = () => current.buildActorLicenceData(data, '2026-11-16')
assert.equal(JSON.stringify(afterLicence()), JSON.stringify(beforeLicence()))

const model = harness().load('lib/actor-affiliation-schema.ts')
const refs = { clubs: Array.from({ length: 4000 }, (_, i) => ({ id: `CL-${i}`, label: `Club ${i}` })), statuses: [{ id: 'S1', label: 'ACTIF' }], functions: [], seasons: [], entityTypes: [], entities: {} }
const affiliationRows = refs.clubs.map(item => ({ kind: 'coach', clubId: item.id, statusId: 'S1', entityTypeId: '', entityId: '', functionId: '', seasonId: '' }))
const beforeAffiliation = () => affiliationRows.map(row => model.affiliationView(row, refs))
const afterAffiliation = () => { const view = model.createAffiliationView(refs); return affiliationRows.map(view) }
assert.equal(JSON.stringify(afterAffiliation()), JSON.stringify(beforeAffiliation()))

const licenceRows = Array.from({ length: 10000 }, (_, i) => ({ athleteId: `A-${i}`, seasonId: 'S1', clubId: `CL-${i % 500}`, sexe: i % 2 ? 'M' : 'F', statut: i % 3 ? 'ACTIF' : 'INACTIF' }))
const oldSummary = vm.runInNewContext(`rows => {
  const summary = rows => { const values = [...new Map(rows.map(row => [row.athleteId + ':' + row.seasonId, row])).values()]; return { total: values.length, hommes: values.filter(row => /^(M|MASCULIN|HOMME)$/i.test(row.sexe.trim())).length, femmes: values.filter(row => /^(F|FÉMININ|FEMININ|FEMME)$/i.test(row.sexe.trim())).length, actives: values.filter(row => /^(ACTIF|ACTIVE|VALIDE)$/i.test(row.statut.trim())).length, nonActives: values.filter(row => !/^(ACTIF|ACTIVE|VALIDE)$/i.test(row.statut.trim())).length } }
  return { totals: summary(rows), byClub: new Map(Array.from({length: 500}, (_, i) => ['CL-' + i, summary(rows.filter(row => row.clubId === 'CL-' + i))])) }
}`)
const { athleteLicenceSummaries } = harness().load('lib/athlete-licence-metrics.ts')
const beforeSummary = () => oldSummary(licenceRows), afterSummary = () => athleteLicenceSummaries(licenceRows)
const serialize = value => JSON.stringify({ totals: value.totals, byClub: [...value.byClub] })
assert.equal(serialize(afterSummary()), serialize(beforeSummary()))

function measure(fn) {
  const cpu = process.cpuUsage(), time = performance.now()
  for (let i = 0; i < 12; i++) fn()
  const used = process.cpuUsage(cpu)
  return { cpuMs: (used.user + used.system) / 1000, elapsedMs: +(performance.now() - time).toFixed(2) }
}
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const results = []
for (const [name, before, after] of [['actorLicenceModel', beforeLicence, afterLicence], ['affiliationLabels', beforeAffiliation, afterAffiliation], ['clubLicenceSummary', beforeSummary, afterSummary]]) {
  before(); after()
  const samples = { before: [], after: [] }
  for (let i = 0; i < 5; i++) {
    for (const key of i % 2 ? ['after', 'before'] : ['before', 'after']) samples[key].push(measure(key === 'before' ? before : after))
  }
  results.push({ name, samples, median: { beforeCpuMs: median(samples.before.map(row => row.cpuMs)), afterCpuMs: median(samples.after.map(row => row.cpuMs)) } })
}
console.log(JSON.stringify({ node: process.version, baseline, iterationsPerSample: 12, samplesPerVersion: 5, order: 'alternating', sizes: { actorLicences: 2000, affiliationLabels: 4000, athleteLicences: 10000, clubs: 500 }, scope: 'isolated real model functions, synthetic records, no HTTP or React rendering', results }, null, 2))
