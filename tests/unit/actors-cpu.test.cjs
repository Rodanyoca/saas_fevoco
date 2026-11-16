const test = require('node:test')
const assert = require('node:assert/strict')
const { harness } = require('../helpers/dashboard-harness.cjs')
const { execFileSync } = require('node:child_process')
const { actorLicenceFixture } = require('../helpers/actors-cpu-fixtures.cjs')

test('la recherche des numeros conserve leur ordre, les doublons et les valeurs vides', () => {
  const { licenceNumbersByActor } = harness().load('lib/actor-search-index.ts')
  const rows = [{ actorId: 'A', numeroLicence: '' }, { actorId: 'A', numeroLicence: 'N1' }, { actorId: 'B', numeroLicence: 'N2' }, { actorId: 'A', numeroLicence: 'N1' }]
  const index = licenceNumbersByActor(rows)
  for (const id of ['A', 'B', 'UNKNOWN']) assert.equal(index.get(id) || '', rows.filter(row => row.actorId === id).map(row => row.numeroLicence).join(' '))
})

test('apercu licences athletes: seules les neuf plages utilisees sont lues', async () => {
  const h = harness()
  await h.load('lib/licences-overview.ts').athleteLicenceOverview()
  console.log(JSON.stringify({ athleteLicenceOverviewLogicalRanges: h.reads.length }))
  assert.equal(h.reads.length, 9)
  assert.ok(!h.reads.some(range => /ACTEURS_LICENCES|COACH_AFFILIATIONS|MEDECIN_AFFILIATIONS|OFFICIELS_AFFILIATIONS|COACHS!|OFFICIELS!|ARBITRES!|MEDECINS!|CYCLES_LICENCES|TYPES_ACTEURS/.test(range)))
})

test('officiels: une seule reconstruction territoriale dans la page', async () => {
  const h = harness()
  await h.load('app/officiels/page.tsx').default()
  // One hierarchy read plus the independent affiliations context, previously 4.
  assert.equal(h.reads.filter(range => range === 'territorial:LIGUES!A:ZZ').length, 2)
})

test('les licences indexees conservent exactement les libelles, doublons et statuts historiques', () => {
  const data = actorLicenceFixture(30)
  data.actors.COACHS.push({ ...data.actors.COACHS[0], nom_complet: 'Doublon ignore' })
  data.affiliations.COACH_AFFILIATIONS.push({ ...data.affiliations.COACH_AFFILIATIONS[0], id_club: 'MISSING' })
  data.refs.STATUT_LICENCE.push({ ...data.refs.STATUT_LICENCE[0], nom_statut_licence: 'Doublon ignore' })
  data.licences.push({ id_licence: 'ORPHAN', id_type_acteur: 'TAC004', id_acteur: 'MISSING', date_debut_validite: '31/02/2026' })
  const path = 'lib/actor-licences-model.ts'
  const source = execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' })
  const before = harness({}, new Set(), { [path]: source }).load(path).buildActorLicenceData(data, '2026-11-16')
  const after = harness().load(path).buildActorLicenceData(data, '2026-11-16')
  assert.equal(JSON.stringify(after), JSON.stringify(before))
})

test('les vues daffiliation indexees preservent les premieres references et les cas federaux', () => {
  const model = harness().load('lib/actor-affiliation-schema.ts')
  const refs = { clubs: [{ id: 'CL', label: 'Premier club' }, { id: 'CL', label: 'Doublon' }], statuses: [{ id: 'S', label: 'ACTIF' }], functions: [], seasons: [], transferTypes: [], entityTypes: [{ id: 'FED', label: 'FÉDÉRATION' }], entities: { FED: [{ id: 'F1', label: 'Federation' }] } }
  const view = model.createAffiliationView(refs)
  for (const kind of ['athlete', 'coach', 'medecin', 'officiel', 'autre']) {
    for (const id of ['CL', 'MISSING', '']) {
      const row = { kind, clubId: id, entityTypeId: 'FED', entityId: '', statusId: 'S', functionId: '', seasonId: '' }
      assert.equal(JSON.stringify(view(row)), JSON.stringify(model.affiliationView(row, refs)))
    }
  }
})

test('la synthese par club preserve la derniere ligne par athlete et saison et les doublons interclubs', () => {
  const { athleteLicenceSummaries } = harness().load('lib/athlete-licence-metrics.ts')
  const rows = [
    { athleteId: 'A', seasonId: 'S', clubId: 'C1', sexe: 'M', statut: 'ACTIF' },
    { athleteId: 'A', seasonId: 'S', clubId: 'C1', sexe: 'FÉMININ', statut: 'INACTIF' },
    { athleteId: 'A', seasonId: 'S', clubId: 'C2', sexe: 'M', statut: 'ACTIF' },
    { athleteId: 'B', seasonId: 'S', clubId: '', sexe: '', statut: 'SUSPENDU' },
  ]
  const previous = list => { const values = [...new Map(list.map(row => [`${row.athleteId}:${row.seasonId}`, row])).values()]; return { total: values.length, hommes: values.filter(row => /^(M|MASCULIN|HOMME)$/i.test(row.sexe.trim())).length, femmes: values.filter(row => /^(F|FÉMININ|FEMININ|FEMME)$/i.test(row.sexe.trim())).length, actives: values.filter(row => /^(ACTIF|ACTIVE|VALIDE)$/i.test(row.statut.trim())).length, nonActives: values.filter(row => !/^(ACTIF|ACTIVE|VALIDE)$/i.test(row.statut.trim())).length } }
  const result = athleteLicenceSummaries(rows)
  assert.equal(JSON.stringify(result.totals), JSON.stringify(previous(rows)))
  for (const id of ['C1', 'C2', '']) assert.equal(JSON.stringify(result.byClub.get(id)), JSON.stringify(previous(rows.filter(row => row.clubId === id))))
})

test('affiliations: les dates des autres acteurs ne sont pas materialisees', async () => {
  let dateReads = 0
  const rows = Array.from({ length: 100 }, (_, id) => ({ id_affiliation_coach: `AF${id}`, id_coach: id === 0 ? 'C1' : 'OTHER', id_club: 'CL1', id_statut_affiliation: 'S1', get date_debut() { dateReads++; return '2026-01-01' }, date_fin: '' }))
  const h = harness({ COACHS: [{ id_coach: 'C1', nom_complet: 'Test' }], COACH_AFFILIATIONS: rows, CLUBS: [{ id_club: 'CL1', nom_club: 'Club' }], STATUTS_AFFILIATION: [{ id_statut_affiliation: 'S1', nom_statut_affiliation: 'ACTIF' }] })
  const result = await h.load('lib/actor-affiliations.ts').listActorAffiliations('coach', 'C1')
  assert.equal(result.affiliations.length, 1)
  assert.equal(dateReads, 1)
})
