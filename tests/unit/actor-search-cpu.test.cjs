const test = require('node:test')
const assert = require('node:assert/strict')
const { harness } = require('../helpers/dashboard-harness.cjs')

function findProps(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (node.props && predicate(node.props)) return node.props
  const children = node.props?.children
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findProps(child, predicate)
    if (found) return found
  }
  return null
}

for (const [kind, component, idKey, dataKey, viewKey] of [
  ['coachs', 'CoachsClient', 'idCoach', 'coachs', 'onViewCoach'],
  ['arbitres', 'ArbitresClient', 'idArbitre', 'arbitres', 'onViewArbitre'],
  ['officiels', 'OfficielsClient', 'idOfficiel', 'officiels', 'onViewOfficiel'],
  ['athletes', 'AthletesClient', 'idAthlete', 'athletes', 'onViewAthlete'],
  ['medecins', 'MedecinsClient', 'idMedecin', 'medecins', 'onViewMedecin'],
  ['autres-acteurs', 'AutresActeursClient', 'idAutreActeur', 'acteurs', 'onView'],
]) test(`${kind}: une recherche reutilise les index et le tri, une sauvegarde invalide le tri`, () => {
  const slots = [], memos = []
  let cursor = 0, sortCalls = 0, licenceReads = 0
  const hooks = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value }] },
    useEffect() { cursor++ },
    useMemo(fn, deps) { const index = cursor++; if (!memos[index] || deps.some((value, i) => !Object.is(value, memos[index].deps[i]))) memos[index] = { deps, value: fn() }; return memos[index].value },
  }
  const h = harness({}, new Set(), {}, { react: hooks, 'next/navigation': { useRouter: () => ({ refresh() {} }) }, '@/lib/sort-utils': { compareLabels: (a, b) => { sortCalls++; return a.localeCompare(b) } } })
  const Client = h.load(`components/${kind}/${kind}-client.tsx`)[component]
  const people = Array.from({ length: 40 }, (_, id) => ({ [idKey]: `P${id}`, nomComplet: `Test ${40 - id}` }))
  const licences = people.map(person => ({ idLicence: `LIC-${person[idKey]}`, get actorId() { licenceReads++; return person[idKey] }, numeroLicence: `LIC-${person[idKey]}`, statutLicence: 'INACTIF', idStatutLicence: 'INACTIF' }))
  const props = { [dataKey]: people, licences, affiliations: [], sexes: [], levels: [], grades: [], structures: [], functions: [], structureTypes: [], seasons: [], specialties: [], affiliationTypes: [], types: [] }
  const render = () => { cursor = 0; return Client(props) }
  const initial = render(), initialSorts = sortCalls, initialReads = licenceReads
  if (kind === 'autres-acteurs') findProps(initial, p => p.type === 'search').onChange({ target: { value: 'Test' } })
  else findProps(initial, p => typeof p.onSearchChange === 'function').onSearchChange('Test')
  const searched = render()
  assert.equal(sortCalls, initialSorts)
  assert.equal(licenceReads, initialReads)
  assert.equal(findProps(searched, p => typeof p[viewKey] === 'function')[dataKey].length, kind === 'athletes' ? 10 : 40)
  findProps(searched, p => typeof p.onSaved === 'function').onSaved({ [idKey]: 'PNEW', nomComplet: 'New Test' })
  render()
  assert.ok(sortCalls > initialSorts)
})
