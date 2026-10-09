/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real domain modules with an isolated Sheets transport. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
function harness() {
  const detail = { competition: { statut: 'ACTIF' }, epreuves: [{ id_epreuve_competition: 'E1', statut: 'ACTIF', id_discipline: 'DISC061' }], phases: [{ id_phase_competition: 'P1', id_epreuve_competition: 'E1', id_mode_phase: 'MPH001', numero_phase: '1', statut: 'ACTIF' }, { id_phase_competition: 'P2', id_epreuve_competition: 'E1', id_mode_phase: 'MPH002', numero_phase: '2', statut: 'ACTIF' }], groupes: [{ id_groupe: 'G1', id_phase_competition: 'P1', statut: 'ACTIF' }], unites: [], participants: [], intervenants: [], distinctions: [], classements: [], matches: [], resultats: [], phasesUnites: ['U1', 'U2'].map(id => ({ id_phase_competition: 'P1', id_groupe: 'G1', id_unite_competition: id, statut: 'ACTIF' })) }
  const writes = []
  const bundle = { references: { TYPES_PHASES: [{ id: 'TP1' }], MODES_PHASES: [{ id: 'MPH001' }] }, referenceData: { TYPES_DISTINCTIONS: [{ id_type_distinction: 'D1', cible_autorisee: 'UNITE_COMPETITION' }] }, data: {} }
  const cache = new Map()
  const mocks = {
    '@/lib/env': { env: { googleSheets: { competitionsSpreadsheetId: 'isolated' } } },
    '@/lib/google-sheets': { appendSheetRecord: async (...args) => writes.push(args), appendSheetRecordsBatch: async (...args) => writes.push(args), updateSheetRecordById: async (...args) => writes.push(args) },
    '@/lib/competitions-v2': { loadCompetitionBundle: async () => bundle, competitionData: () => detail },
    '@/lib/data': { getClubs: async () => [{ idClub: 'C1', nomClub: 'Club', statut: 'Actif' }], getAthletes: async () => [] },
    '@/lib/competition-people': { competitionPeopleOptions: async () => [] },
  }
  function load(name) {
    if (mocks[name]) return mocks[name]
    const file = path.join(root, name.replace('@/', '') + '.ts')
    if (cache.has(file)) return cache.get(file)
    const exports = {}; cache.set(file, exports)
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: load })
    return exports
  }
  return { detail, writes, load }
}
test('phase creation rejects an inactive event and an invalid order', async () => {
  for (const invalid of ['event', 'order']) {
    const h = harness(); if (invalid === 'event') h.detail.epreuves[0].statut = 'INACTIF'
    await assert.rejects(h.load('@/lib/competition-structure').createPhase('VOL-COMP-2026-001', { id_epreuve_competition: 'E1', id_type_phase: 'TP1', id_mode_phase: 'MPH001', numero_phase: invalid === 'order' ? 'abc' : '1', nom_phase: 'Phase' }))
    assert.equal(h.writes.length, 0)
  }
})
test('entry rejects inactive events, phases and groups', async () => {
  for (const collection of ['epreuves', 'phases', 'groupes']) {
    const h = harness(); h.detail[collection][0].statut = 'INACTIF'
    await assert.rejects(h.load('@/lib/competition-entries').createEntry('VOL-COMP-2026-001', { id_epreuve_competition: 'E1', id_phase_competition: 'P1', id_groupe: 'G1', id_club: 'C1', date_inscription: '09102026' }))
    assert.equal(h.writes.length, 0)
  }
})
test('match rejects an inactive group even when assignments still exist', async () => {
  const h = harness(); h.detail.groupes[0].statut = 'INACTIF'
  await assert.rejects(h.load('@/lib/competition-matches').createMatch('VOL-COMP-2026-001', { id_phase_competition: 'P1', id_groupe: 'G1', id_unite_a: 'U1', id_unite_b: 'U2', date_match: '09102026', heure_match: '18:00' }))
  assert.equal(h.writes.length, 0)
})
test('qualification rejects a winning match outside the source phase', async () => {
  const h = harness(); h.detail.matches.push({ id_match: 'M1', id_phase_competition: 'FOREIGN' }); h.detail.resultats.push({ id_match: 'M1', id_unite_vainqueur: 'U1' })
  await assert.rejects(h.load('@/lib/competition-standings').qualifyUnit('VOL-COMP-2026-001', { id_unite_competition: 'U1', id_phase_source: 'P1', id_phase_competition: 'P2', id_match_source: 'M1', date_affectation: '09102026' }))
  assert.equal(h.writes.length, 0)
})
test('distinction rejects a match outside the selected event without a selected phase', async () => {
  const h = harness(); h.detail.unites.push({ id_unite_competition: 'U1', id_epreuve_competition: 'E1' }); h.detail.phases.push({ id_phase_competition: 'P3', id_epreuve_competition: 'E2' }); h.detail.matches.push({ id_match: 'M1', id_phase_competition: 'P3' })
  await assert.rejects(h.load('@/lib/competition-distinctions').createDistinction('VOL-COMP-2026-001', { id_type_distinction: 'D1', id_unite_competition: 'U1', id_epreuve_competition: 'E1', id_match: 'M1', date_attribution: '09102026' }))
  assert.equal(h.writes.length, 0)
})
test('valid phase, group, entry and match still write canonical records', async () => {
  const h = harness()
  await h.load('@/lib/competition-structure').createPhase('VOL-COMP-2026-001', { id_epreuve_competition: 'E1', id_type_phase: 'TP1', id_mode_phase: 'MPH001', numero_phase: '1', nom_phase: 'Phase' })
  await h.load('@/lib/competition-structure').createGroup('VOL-COMP-2026-001', { id_phase_competition: 'P1', nom_groupe: 'Groupe A' })
  await h.load('@/lib/competition-entries').createEntry('VOL-COMP-2026-001', { id_epreuve_competition: 'E1', id_phase_competition: 'P1', id_groupe: 'G1', id_club: 'C1', date_inscription: '09/10/2026' })
  const entryRecords = h.writes[2][1]
  assert.equal(entryRecords[0].record.date_inscription, '2026-10-09')
  assert.equal(entryRecords[2].sheetName, 'COMPETITIONS_PHASES_UNITES')
  await h.load('@/lib/competition-matches').createMatch('VOL-COMP-2026-001', { id_phase_competition: 'P1', id_groupe: 'G1', id_unite_a: 'U1', id_unite_b: 'U2', date_match: '09/10/2026', heure_match: '18:00' })
  assert.equal(h.writes[3][2].date_match, '2026-10-09')
  assert.match(h.writes[3][2].id_match, /^VOL-MAT-/)
})
test('valid qualification and distinction retain their selected context', async () => {
  const h = harness()
  h.detail.unites.push({ id_unite_competition: 'U1', id_epreuve_competition: 'E1' })
  h.detail.matches.push({ id_match: 'M1', id_phase_competition: 'P1' })
  h.detail.resultats.push({ id_match: 'M1', id_unite_vainqueur: 'U1' })
  await h.load('@/lib/competition-standings').qualifyUnit('VOL-COMP-2026-001', { id_unite_competition: 'U1', id_phase_source: 'P1', id_phase_competition: 'P2', id_match_source: 'M1', date_affectation: '09/10/2026' })
  assert.equal(h.writes[0][1], 'COMPETITIONS_PHASES_UNITES')
  assert.equal(h.writes[0][2].id_phase_source, 'P1')
  await h.load('@/lib/competition-distinctions').createDistinction('VOL-COMP-2026-001', { id_type_distinction: 'D1', id_unite_competition: 'U1', id_epreuve_competition: 'E1', id_match: 'M1', date_attribution: '09/10/2026' })
  assert.equal(h.writes[1][2].id_match, 'M1')
})
test('closed competition rejects every mutation exercised by the phase workflow', async () => {
  const h = harness(); h.detail.competition.statut = 'TERMINEE'
  const actions = [
    () => h.load('@/lib/competition-structure').createPhase('VOL-COMP-2026-001', {}),
    () => h.load('@/lib/competition-structure').createGroup('VOL-COMP-2026-001', {}),
    () => h.load('@/lib/competition-entries').createEntry('VOL-COMP-2026-001', {}),
    () => h.load('@/lib/competition-matches').createMatch('VOL-COMP-2026-001', {}),
    () => h.load('@/lib/competition-standings').qualifyUnit('VOL-COMP-2026-001', {}),
    () => h.load('@/lib/competition-standings').recalculateStandings('VOL-COMP-2026-001', 'P1', 'G1'),
    () => h.load('@/lib/competition-distinctions').createDistinction('VOL-COMP-2026-001', {}),
  ]
  for (const action of actions) await assert.rejects(action(), error => error.status === 409)
  assert.equal(h.writes.length, 0)
})
