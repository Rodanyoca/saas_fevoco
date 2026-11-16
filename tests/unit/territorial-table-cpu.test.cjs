const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { execFileSync } = require('node:child_process')
const { harness } = require('../helpers/dashboard-harness.cjs')

test('la pagination ne relance pas la recherche et une recherche vide ne lit pas les champs', () => {
  const states = [], memos = []
  let cursor = 0, reads = 0
  const hooks = {
    useState(initial) {
      const index = cursor++
      if (!(index in states)) states[index] = initial
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
    },
    useMemo(fn, deps) {
      const index = cursor++
      if (!memos[index] || deps.some((value, i) => !Object.is(value, memos[index].deps[i]))) memos[index] = { deps, value: fn() }
      return memos[index].value
    },
  }
  const source = process.env.TERRITORIAL_TABLE_BASELINE === '1'
    ? execFileSync('git', ['show', 'HEAD:components/dashboard/data-table.tsx'], { encoding: 'utf8' })
    : fs.readFileSync(path.resolve(__dirname, '../../components/dashboard/data-table.tsx'), 'utf8')
  const h = harness(), module = { exports: {} }
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  vm.runInNewContext(js, { module, exports: module.exports, require: name => {
    if (name === 'react') return hooks
    if (name.startsWith('@/components/')) return new Proxy({}, { get: (_target, key) => key })
    if (name.startsWith('@/lib/')) return h.load(`${name.slice(2)}.ts`)
    return require(name)
  } })
  const data = Array.from({ length: 100 }, (_, id) => ({ id, name: 'Test', get hidden() { reads++; return 'hidden' } }))
  const props = { data, columns: [{ key: 'name', header: 'Nom' }] }
  function render() { cursor = 0; return module.exports.DataTable(props) }
  render()
  assert.equal(reads, 0, 'La recherche vide ne doit pas materialiser les valeurs des profils')
  states[0] = 'test'; render()
  const searched = reads
  assert.equal(searched, 100)
  states[2] = 2; render()
  assert.equal(reads, searched, 'La pagination doit reutiliser le resultat filtre')
  states[0] = 'hidden'; render()
  assert.equal(reads, searched + 100, 'Une nouvelle recherche doit etre recalculee')
  props.data = [...data]; render()
  assert.equal(reads, searched + 200, 'Une nouvelle source doit invalider le resultat memorise')
  props.filterValues = { name: 'Test' }; render()
  assert.equal(reads, searched + 300, 'Les filtres controles doivent invalider le resultat memorise')
})

test('la recherche et les filtres conservent les resultats historiques', () => {
  const { filterDataTableRows } = harness().load('lib/data-table-filter.ts')
  const rows = [{ id: '1', name: 'Kinshasa', status: 'ACTIF', n: null }, { id: '2', name: 'Goma', status: 'INACTIF', n: undefined }, { id: '3', name: '50', status: true }, {}]
  const previous = (query, values) => rows.filter(item => {
    if (!Object.values(item).some(value => String(value).toLowerCase().includes(query.toLowerCase()))) return false
    return Object.entries(values).every(([key, value]) => !value || value === 'all' || String(item[key]) === value)
  })
  for (const query of ['', 'KIN', 'null', 'undefined', 'true', '50', 'absent']) {
    for (const values of [{}, { status: 'all' }, { status: '' }, { status: 'ACTIF' }, { unknown: 'undefined' }]) {
      assert.deepEqual([...filterDataTableRows(rows, query, values)], previous(query, values))
    }
  }
})
