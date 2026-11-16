const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")
const root = path.resolve(__dirname, '../..')
function harness(data = {}, failures = new Set(), sources = {}, overrides = {}) {
  const reads = []
  const cache = new Map()
  const sheets = {
    getSheetDataFrom: async (book, range) => { reads.push(`${book}:${range}`); if (failures.has(range.split('!')[0])) throw Error('Source unavailable'); return data[range.split('!')[0]] || [] },
    getSheetsDataFrom: async (book, ranges) => { reads.push(...ranges.map(range => `${book}:${range}`)); return Object.fromEntries(ranges.map(range => [range.split('!')[0], data[range.split('!')[0]] || []])) },
  }
  const config = Object.fromEntries(['territorial', 'acteurs', 'referentiels', 'affiliations', 'licences', 'competitions', 'equipeNationale', 'activities', 'documents'].map(name => [`${name}SpreadsheetId`, name]))
  const mocks = {
    'server-only': {},
    '@/lib/google-sheets': sheets,
    '@/lib/env': { env: { googleSheets: { ...config, clientEmail: 'test', privateKey: 'test' } }, isActeursGoogleSheetsConfigured: () => true },
    '@/lib/sports-mutations': {}, '@/lib/sports-atomic-store': { sportsWritesEnabled: () => false },
    '@/lib/google-document-file': {},
    '@/lib/sports-model': { sportsToday: () => '2026-11-16', currentSportsClubs: () => new Map(), temporalState: () => '' },
    ...overrides,
  }
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }; cache.set(file, module)
    const source = sources[path.relative(root, file).replaceAll("\\", "/")] ?? fs.readFileSync(file, "utf8")
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
    vm.runInNewContext(js, { module, exports: module.exports, console, Date, Map, Set, require: name => {
      if (name in mocks) return mocks[name]
      if (name.startsWith('@/components/')) return new Proxy({}, { get: () => () => null })
      if (name.startsWith('@/') || name.startsWith('.')) {
        const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)
        return load(fs.existsSync(`${base}.ts`) ? `${base}.ts` : fs.existsSync(`${base}.tsx`) ? `${base}.tsx` : base)
      }
      return require(name)
    } }, { filename: file })
    return module.exports
  }
  return { reads, load: file => load(path.join(root, file)) }
}

module.exports = { harness }
