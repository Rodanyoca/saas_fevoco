/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Verify real Sheets requests against an isolated API client. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function harness() {
  const rows = { INSCRIPTIONS: [['observations', 'date_inscription', 'id_participation'], ['Existing', '2025-01-01', 'I1']], UNITES: [['statut', 'id_unite'], ['ACTIF', 'U1']] }
  const writes = [], invalidated = [], reads = []
  const client = { spreadsheets: {
    values: { batchGet: async ({ ranges }) => { reads.push(ranges); return { data: { valueRanges: ranges.map(range => ({ values: rows[range.split('!')[0]] })) } } } },
    get: async () => ({ data: { sheets: [{ properties: { title: 'INSCRIPTIONS', sheetId: 1 } }, { properties: { title: 'UNITES', sheetId: 2 } }] } }),
    batchUpdate: async request => writes.push(request),
  } }
  const mocks = {
    '@/lib/env': { env: { googleSheets: {} } },
    'next/cache': { revalidateTag: tag => invalidated.push(tag) },
    '@/lib/google-sheets-resilience': {},
    '@/lib/sheet-read-batcher': { createSheetReadBatcher: () => ({}) },
    '@/lib/sheet-values': {},
    'googleapis': { google: { auth: { JWT: class {} }, sheets: () => client } },
  }
  const exports = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, 'google-sheets.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name] } })
  return { rows, writes, reads, invalidated, update: exports.updateSheetRecordsBatch }
}

test('header-based batch updates preserve unrelated cells and apply canonical date formatting in one request', async () => {
  const h = harness()
  await h.update('isolated', [
    { sheetName: 'INSCRIPTIONS', idHeader: 'id_participation', id: 'I1', record: { date_inscription: '2024-02-29' }, dateHeaders: ['date_inscription'] },
    { sheetName: 'UNITES', idHeader: 'id_unite', id: 'U1', record: { statut: 'INACTIF' } },
  ])
  assert.equal(h.reads.length, 1)
  assert.equal(h.writes.length, 1)
  const requests = h.writes[0].requestBody.requests
  assert.equal(requests.length, 2)
  assert.equal(requests[0].updateCells.range.startRowIndex, 1)
  assert.equal(requests[0].updateCells.range.startColumnIndex, 1)
  assert.equal(requests[0].updateCells.rows[0].values[0].userEnteredValue.stringValue, '2024-02-29')
  assert.equal(requests[0].updateCells.rows[0].values[0].userEnteredFormat.numberFormat.pattern, 'yyyy-mm-dd')
  assert.equal(requests[1].updateCells.range.startColumnIndex, 0)
  assert.equal(h.invalidated.length, 2)
})

test('missing columns, identifiers or duplicate IDs reject the entire update before writing', async () => {
  for (const kind of ['column', 'missing', 'duplicate']) {
    const h = harness()
    if (kind === 'missing') h.rows.UNITES = [['statut', 'id_unite']]
    if (kind === 'duplicate') h.rows.UNITES.push(['ACTIF', 'U1'])
    await assert.rejects(h.update('isolated', [
      { sheetName: 'INSCRIPTIONS', idHeader: 'id_participation', id: 'I1', record: { observations: 'Changed' } },
      { sheetName: 'UNITES', idHeader: 'id_unite', id: 'U1', record: kind === 'column' ? { absent: 'X' } : { statut: 'INACTIF' } },
    ]))
    assert.equal(h.writes.length, 0)
    assert.equal(h.invalidated.length, 0)
  }
})
