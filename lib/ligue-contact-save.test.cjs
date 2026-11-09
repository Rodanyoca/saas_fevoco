/* global require */
/* eslint-disable @typescript-eslint/no-require-imports -- Executes the real territorial mutation with isolated sources and writes. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function mutation({ invalidContacts = false } = {}) {
  const calls = []
  const contact = { sheetName: 'PERSONNES_CONTACT_ENTITES', idHeader: 'id_contact_entite', id: 'VOL-CONTACT-NEW', create: true, record: { id_entite: '01' } }
  const mocks = {
    'server-only': {},
    '@/lib/env': { env: { googleSheets: { territorialSpreadsheetId: 'isolated-test' } } },
    '@/lib/data': {
      getLigues: async () => [{ idLigue: '01', idProvince: 'PROV001', nomLigue: 'Ligue test' }],
      getProvinceOptions: async () => [{ idProvince: 'PROV001', nomProvince: 'Province test' }],
    },
    '@/lib/compact-date': { formatDateForSheet: input => { if (input === '31/02/2026') throw new Error('Invalid date'); return '2026-11-09' } },
    '@/lib/ligue-contact-rules': { LIGUE_CONTACT_SHEET: 'PERSONNES_CONTACT_ENTITES' },
    '@/lib/ligue-contact-editor': { prepareLigueContactChanges: async (id, payload, revision) => {
      calls.push({ kind: 'validate', id, payload, revision })
      if (invalidContacts) throw new Error('Invalid contacts')
      return { records: [contact], validateRows() {} }
    } },
    '@/lib/google-sheets': {
      updateSheetRecordsBatch: async (...args) => calls.push({ kind: 'batch', args }),
      updateSheetRecordById: async () => calls.push({ kind: 'legacy-write' }),
      formatSheetDateColumn: async () => calls.push({ kind: 'format' }),
    },
  }
  const module = { exports: {} }
  const js = ts.transpileModule(fs.readFileSync('lib/territorial-mutations.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(js, { module, exports: module.exports, require: name => { if (!(name in mocks)) throw new Error(name); return mocks[name] } })
  return { update: module.exports.updateLigue, calls }
}

const payload = () => ({ nomLigue: 'Ligue modifiée', idProvince: 'PROV001', dateAffiliation: '09/11/2026', statut: 'ACTIF', responsables: [], responsablesRevision: 'revision-test' })

test('the complete form saves league and designations together after validation', async () => {
  const { update, calls } = mutation()
  const saved = await update('01', payload())
  assert.equal(saved.idLigue, '01')
  assert.equal(saved.dateAffiliation, '2026-11-09')
  assert.deepEqual(calls.map(call => call.kind), ['validate', 'batch'])
  assert.equal(calls[1].args[1][0].record.date_affiliation_ligue, '2026-11-09')
  assert.equal(calls[1].args[1][1].sheetName, 'PERSONNES_CONTACT_ENTITES')
})

test('invalid contacts cannot partially save or format the league', async () => {
  const { update, calls } = mutation({ invalidContacts: true })
  await assert.rejects(update('01', payload()), /Invalid contacts/)
  assert.deepEqual(calls.map(call => call.kind), ['validate'])
})

test('an impossible date is rejected before any write or contact mutation', async () => {
  const { update, calls } = mutation()
  await assert.rejects(update('01', { ...payload(), dateAffiliation: '31/02/2026' }), /date d’affiliation est invalide/)
  assert.equal(calls.length, 0)
})
