/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Isolate the Sheets transport while exercising the real mutation. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function harness() {
  const detail = {
    competition: { statut: 'EN_COURS' },
    epreuves: [{ id_epreuve_competition: 'E1', statut: 'ACTIF' }],
    unites: [{ id_unite_competition: 'U1', id_participation: 'I1', id_epreuve_competition: 'E1', id_club: 'C1', id_type_unite_competition: 'TUC004', statut: 'ACTIF' }],
    participants: [{ id_participation: 'I1', statut_participation: 'ACTIF' }],
    phasesUnites: [{ id_phase_unite: 'A1', id_unite_competition: 'U1', id_phase_competition: 'P1', id_groupe: 'G1', id_type_affectation_phase: 'TAP001', statut: 'ACTIF' }],
    phases: [{ id_phase_competition: 'P1', id_epreuve_competition: 'E1', id_mode_phase: 'MPH001', statut: 'ACTIF' }, { id_phase_competition: 'P2', id_epreuve_competition: 'E1', id_mode_phase: 'MPH002', statut: 'ACTIF' }],
    groupes: [{ id_groupe: 'G1', id_phase_competition: 'P1', statut: 'ACTIF' }, { id_groupe: 'G2', id_phase_competition: 'P1', statut: 'ACTIF' }],
    matches: [], intervenants: [], classements: [], distinctions: [],
  }
  const writes = [], cache = new Map()
  const mocks = {
    '@/lib/env': { env: { googleSheets: { competitionsSpreadsheetId: 'isolated' } } },
    '@/lib/google-sheets': { updateSheetRecordsBatch: async (...args) => writes.push(args) },
    '@/lib/competitions-v2': { loadCompetitionBundle: async () => ({}), competitionData: () => detail },
    '@/lib/competition-entries': { competitionEntryOptions: async () => ({ clubs: [{ id: 'C1' }, { id: 'C2' }] }) },
  }
  function load(name) {
    if (mocks[name]) return mocks[name]
    if (cache.has(name)) return cache.get(name)
    const exports = {}; cache.set(name, exports)
    const source = fs.readFileSync(path.join(__dirname, '..', name.replace('@/', '') + '.ts'), 'utf8')
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: load })
    return exports
  }
  const input = { id_club: 'C1', id_phase_competition: 'P1', id_groupe: 'G1', statut: 'ACTIF', date_inscription: '29/02/2024', observations: 'Correction' }
  return { detail, input, writes, update: load('@/lib/competition-entry-edit').updateCompetitionEntry }
}

test('edit preserves identifiers and writes unit, participation and canonical assignment together', async () => {
  const h = harness()
  await h.update('COMP', 'U1', { ...h.input, id_club: 'C2', id_groupe: 'G2', id_unite_competition: 'FORGED' })
  assert.equal(h.writes.length, 1)
  const records = h.writes[0][1]
  assert.deepEqual(Array.from(records, r => r.sheetName), ['COMPETITIONS_UNITES', 'COMPETITIONS_PARTICIPANTS', 'COMPETITIONS_PHASES_UNITES'])
  assert.deepEqual(Array.from(records, r => r.id), ['U1', 'I1', 'A1'])
  assert.equal(records[0].record.id_club, 'C2')
  assert.equal(records[1].record.date_inscription, '2024-02-29')
  assert.equal(records[2].record.id_groupe, 'G2')
  assert.equal(records[2].record.date_affectation, '2024-02-29')
  assert.ok(records.every(r => !('id_unite_competition' in r.record)))
  assert.ok(records[1].dateHeaders.includes('date_inscription'))
})

test('closed competitions, foreign units and missing initial links never write', async () => {
  for (const kind of ['closed', 'foreign', 'participation', 'assignment']) {
    const h = harness()
    if (kind === 'closed') h.detail.competition.statut = 'TERMINEE'
    if (kind === 'participation') h.detail.participants = []
    if (kind === 'assignment') h.detail.phasesUnites = []
    await assert.rejects(h.update('COMP', kind === 'foreign' ? 'OTHER' : 'U1', h.input))
    assert.equal(h.writes.length, 0)
  }
})

test('invalid dates, statuses, clubs, foreign phases and groups never write', async () => {
  for (const patch of [{ date_inscription: '29/02/2025' }, { date_inscription: '31022026' }, { statut: 'UNKNOWN' }, { id_club: 'FOREIGN' }, { id_club: '' }, { id_phase_competition: 'FOREIGN' }, { id_groupe: 'FOREIGN' }, { id_phase_competition: 'P2', id_groupe: 'G1' }]) {
    const h = harness()
    await assert.rejects(h.update('COMP', 'U1', { ...h.input, ...patch }))
    assert.equal(h.writes.length, 0)
  }
})

test('match or downstream dependencies lock identity, assignment and status but allow annotations', async () => {
  for (const collection of ['matches', 'intervenants', 'classements', 'distinctions', 'phasesUnites']) {
    for (const patch of [{ id_club: 'C2' }, { id_groupe: 'G2' }, { statut: 'INACTIF' }]) {
      const h = harness()
      h.detail[collection].push({ id_unite_a: 'U1', id_unite_competition: 'U1', id_phase_unite: 'A2', date_match: '2026-01-01' })
      await assert.rejects(h.update('COMP', 'U1', { ...h.input, ...patch }))
      assert.equal(h.writes.length, 0)
      await h.update('COMP', 'U1', h.input)
      assert.equal(h.writes.length, 1)
    }
  }
})

test('registration after an existing match is rejected', async () => {
  const h = harness(); h.detail.matches.push({ id_unite_a: 'U1', date_match: '2024-02-01' })
  await assert.rejects(h.update('COMP', 'U1', h.input))
  assert.equal(h.writes.length, 0)
})

test('duplicate active club and invalid group in a non-group phase are rejected', async () => {
  const h = harness(); h.detail.unites.push({ ...h.detail.unites[0], id_unite_competition: 'U2', id_club: 'C2' })
  await assert.rejects(h.update('COMP', 'U1', { ...h.input, id_club: 'C2' }))
  assert.equal(h.writes.length, 0)
  await h.update('COMP', 'U1', { ...h.input, id_phase_competition: 'P2', id_groupe: '' })
  assert.equal(h.writes[0][1][2].record.id_groupe, '')
})

test('deactivation synchronizes the three records', async () => {
  const h = harness(); await h.update('COMP', 'U1', { ...h.input, statut: 'INACTIF', date_inscription: '' })
  const records = h.writes[0][1]
  assert.equal(records[0].record.statut, 'INACTIF')
  assert.equal(records[1].record.statut_participation, 'INACTIF')
  assert.equal(records[2].record.statut, 'INACTIF')
  assert.equal(records[1].record.date_inscription, '')
})

test('reactivation requires an active event, phase and group and rejects duplicate clubs', async () => {
  for (const kind of ['event', 'phase', 'group', 'duplicate']) {
    const h = harness(); h.detail.unites[0].statut = 'INACTIF'; h.detail.participants[0].statut_participation = 'INACTIF'
    if (kind === 'event') h.detail.epreuves[0].statut = 'INACTIF'
    if (kind === 'phase') h.detail.phases[0].statut = 'INACTIF'
    if (kind === 'group') h.detail.groupes[0].statut = 'INACTIF'
    if (kind === 'duplicate') h.detail.unites.push({ ...h.detail.unites[0], id_unite_competition: 'U2', statut: 'ACTIF' })
    await assert.rejects(h.update('COMP', 'U1', h.input))
    assert.equal(h.writes.length, 0)
  }
})
