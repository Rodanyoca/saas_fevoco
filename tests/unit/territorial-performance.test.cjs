const test = require('node:test')
const assert = require('node:assert/strict')
const { harness } = require('../helpers/dashboard-harness.cjs')

for (const page of ['ligues', 'ententes']) test(`${page}: seuls les liens necessaires au comptage sont serialises`, async () => {
  const h = harness({ ATHLETES: [{ id_athlete: 'A1', nom_complet: 'Test', id_club: 'C1', telephone: 'TEST-CONTACT', email: 'test@example.invalid' }] })
  const tree = await h.load(`app/${page}/page.tsx`).default()
  const props = tree.props.children.props
  assert.equal(props.athletes.length, 1)
  assert.deepEqual(Object.keys(props.athletes[0]).sort(), ['clubId', 'idAthlete'])
  assert.equal(h.reads.filter(range => range === 'referentiels:SEXES!A:C').length, 1)
})

test('les liens conservent exactement les effectifs valides et les doublons de la source', async () => {
  const h = harness({ ATHLETES: [
    { id_athlete: 'A1', nom_complet: 'Test', id_club: 'C1' },
    { id_athlete: 'A1', nom_complet: 'Test', id_club: 'C1' },
    { id_athlete: 'A2', nom_complet: 'Sans club', id_club: '' },
    { id_athlete: 'A3', nom_complet: '' },
    { id_athlete: '', nom_complet: 'Sans ID' },
  ] })
  const data = h.load('lib/data.ts')
  const original = await data.getAthletes()
  const links = await data.getAthleteTerritorialLinks()
  assert.equal(JSON.stringify(links), JSON.stringify(original.map(({ idAthlete, clubId }) => ({ idAthlete, clubId }))))
  assert.equal(links.length, 3)
  const { buildLigueHierarchy } = h.load('lib/territorial-hierarchy.ts')
  const args = [{ idLigue: 'L1' }, [{ idEntente: 'E1', idLigue: 'L1' }], [{ idClub: 'C1', idEntente: 'E1' }]]
  assert.equal(buildLigueHierarchy(...args, links).athletes.length, buildLigueHierarchy(...args, original).athletes.length)
})
