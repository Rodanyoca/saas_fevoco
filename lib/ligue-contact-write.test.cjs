/* global require, setTimeout, clearTimeout */
/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS harness runs the real Sheets batch writer. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function writer() {
  const tables = {
    LIGUES: [['nom_ligue', 'date_affiliation_ligue', 'id_ligue'], ['Ligue test', '', '01']],
    PERSONNES_CONTACT_ENTITES: [['statut', 'id_entite', 'id_contact_entite', 'id_type_structure', 'id_type_acteur', 'id_acteur', 'fonction_contact', 'est_contact_principal', 'observation']],
  }
  const calls = []
  const client = { spreadsheets: {
    values: { batchGet: async ({ ranges }) => ({ data: { valueRanges: ranges.map(range => ({ values: tables[range.split('!')[0]] })) } }) },
    get: async () => ({ data: { sheets: Object.keys(tables).map((title, sheetId) => ({ properties: { title, sheetId } })) } }),
    batchUpdate: async args => { calls.push(args); return {} },
  } }
  const module = { exports: {} }
  const load = name => {
    if (name === '@/lib/env') return { env: { googleSheets: { clientEmail: 'test', privateKey: 'test' } } }
    if (name === 'next/cache') return { revalidateTag() {} }
    if (name === '@/lib/sheet-read-batcher') return { createSheetReadBatcher: () => () => {} }
    if (name === '@/lib/google-sheets-resilience' || name === '@/lib/sheet-values') return {}
    if (name === 'googleapis') return { google: { auth: { JWT: class {} }, sheets: () => client } }
    throw new Error(`Unexpected import: ${name}`)
  }
  const js = ts.transpileModule(fs.readFileSync('lib/google-sheets.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(js, { module, exports: module.exports, require: load, setTimeout, clearTimeout })
  return { write: module.exports.updateSheetRecordsBatch, calls, tables }
}

const changes = () => [
  { sheetName: 'LIGUES', idHeader: 'id_ligue', id: '01', record: { date_affiliation_ligue: '2026-11-09', nom_ligue: 'Nouveau nom' }, dateHeaders: ['date_affiliation_ligue'] },
  { sheetName: 'PERSONNES_CONTACT_ENTITES', idHeader: 'id_contact_entite', id: 'VOL-CONTACT-TEST', create: true, record: {
    id_contact_entite: 'VOL-CONTACT-TEST', id_type_structure: 'STR001', id_entite: '01', id_type_acteur: 'TAC003', id_acteur: '001', fonction_contact: 'Président', est_contact_principal: true, statut: 'ACTIF', observation: '',
  } },
]

test('ligue and contact writes use one atomic request, actual header positions, text identifiers and boolean principal', async () => {
  const { write, calls } = writer()
  await write('isolated-test', changes())
  assert.equal(calls.length, 1)
  const requests = calls[0].requestBody.requests
  const date = requests.find(request => request.updateCells?.range.startColumnIndex === 1).updateCells
  assert.equal(date.rows[0].values[0].userEnteredValue.stringValue, '2026-11-09')
  assert.equal(date.rows[0].values[0].userEnteredFormat.numberFormat.pattern, 'yyyy-mm-dd')
  const appended = requests.find(request => request.appendCells).appendCells.rows[0].values
  assert.equal(appended[1].userEnteredValue.stringValue, '01')
  assert.equal(appended[7].userEnteredValue.boolValue, true)
  assert.equal(appended[5].userEnteredValue.stringValue, '001')
})

test('a stale revision aborts before any write', async () => {
  const { write, calls } = writer()
  await assert.rejects(write('isolated-test', changes(), () => { throw new Error('Stale contacts') }), /Stale contacts/)
  assert.equal(calls.length, 0)
})

test('missing or duplicate headers prevent the whole batch from being sent', async () => {
  for (const invalid of ['missing', 'duplicate']) {
    const { write, tables, calls } = writer()
    if (invalid === 'missing') tables.PERSONNES_CONTACT_ENTITES[0][6] = 'other_header'
    else tables.PERSONNES_CONTACT_ENTITES[0][6] = 'id_acteur'
    await assert.rejects(write('isolated-test', changes()), /Colonne|dupliqués/)
    assert.equal(calls.length, 0)
  }
})
