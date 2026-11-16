const test = require("node:test")
const assert = require("node:assert/strict")
const { harness } = require("../helpers/dashboard-harness.cjs")

test('le dashboard ne lit pas les details invisibles et ne reconstruit pas trois fois le territoire', async () => {
  const h = harness()
  const page = h.load('app/page.tsx')
  await page.default()
  console.log(JSON.stringify({ logicalSheetReads: h.reads.length, uniqueRanges: new Set(h.reads).size }))
  assert.equal(h.reads.filter(range => range === 'territorial:LIGUES!A:ZZ').length, 1)
  assert.ok(h.reads.length <= 29, `Read budget exceeded: ${h.reads.length}`)
  assert.ok(!h.reads.some(range => /DOCUMENTS_FICHIERS|DOCUMENTS_RELATIONS|TYPES_TRANSFERT|FONCTION_OFFICIEL|CYCLES_LICENCES/.test(range)))
})

test('les compteurs legers conservent les statuts, les saisons et les filtres metier existants', async () => {
  const fixture = {
    STATUTS_AFFILIATION: [{ id_statut_affiliation: 'SAF001', nom_statut_affiliation: 'ACTIF' }],
    STATUT_LICENCE: [{ id_statut_licence: 'L1', nom_statut_licence: 'ACTIF' }],
    SAISON: [{ id_saison: 'S1', date_fin: '2099-12-31' }],
    ATHLETE_AFFILIATIONS: [{ id_affiliation_athlete: 'AF1', id_athlete: 'A1', id_statut_affiliation: 'SAF001' }, { id_affiliation_athlete: '', id_athlete: 'A2' }],
    ATHLETE_LICENCES: [{ id_licence: 'LA1', id_athlete: 'A1', id_saison: 'S1', date_fin_validite: '2000-01-01', id_statut_licence: 'L1' }],
    ACTEURS_LICENCES: [{ id_licence: 'LC1', id_coach: 'C1', id_type_acteur: 'TAC002', id_statut_licence: 'L1', date_fin_validite: '2000-01-01' }, { id_licence: 'INVALID', id_type_acteur: 'TAC002' }, { id_licence: 'OTHER', id_type_acteur: 'UNKNOWN' }],
  }
  const h = harness(fixture)
  const result = await h.load('lib/dashboard-records.ts').loadDashboardRecords()
  assert.deepEqual(JSON.parse(JSON.stringify(result.affiliations)), { total: 1, active: 1, inactive: 0 })
  const old = h.load('lib/actor-records.ts')
  const metrics = h.load('lib/dashboard-metrics.ts')
  const getters = ['getAthleteLicences', 'getCoachLicences', 'getArbitreLicences', 'getMedecinLicences', 'getOfficielLicences']
  for (let i = 0; i < getters.length; i++) {
    const previous = metrics.calculateLicenceMetrics(await old[getters[i]]())
    const { label, ...current } = result.licenceRows[i]
    assert.deepEqual(JSON.parse(JSON.stringify(current)), JSON.parse(JSON.stringify(previous)), label)
  }
  assert.equal(result.totalLicences, 2)
  const legacyAffiliations = (await Promise.all(['getAthleteAffiliations', 'getCoachAffiliations', 'getMedecinAffiliations', 'getOfficielAffiliations'].map(name => old[name]()))).flat()
  assert.equal(result.affiliations.total, legacyAffiliations.length)
  assert.equal(result.affiliations.active, legacyAffiliations.filter(row => metrics.isMetricActive(row.statutAffiliation)).length)
})

test('le repertoire leger conserve les effectifs et la repartition des anciens getters', async () => {
  const h = harness({
    SEXES: [{ id_sexe: 'S1', nom_sexe: 'Masculin' }],
    LIGUES: [{ id_ligue: 'L1', nom_ligue: 'Test', statut: 'ACTIF' }],
    ENTENTES: [{ id_entente: 'E1', nom_entente: 'Test', id_ligue: 'L1', statut: 'INACTIF' }],
    CLUBS: [{ id_club: 'C1', nom_club: 'Test', id_entente: 'E1' }, { id_club: 'INVALID' }],
    ATHLETES: [{ id_athlete: 'A1', nom_complet: 'Test', id_sexe: 'S1', statut: 'ACTIF' }, { id_athlete: 'INVALID' }],
    COACHS: [{ id_coach: 'C1', nom_complet: 'Test', sexe: 'F', statut: 'INACTIF' }],
  })
  const result = await h.load('lib/dashboard-directory.ts').loadDashboardDirectory()
  const previous = h.load('lib/data.ts')
  const metrics = h.load('lib/dashboard-metrics.ts')
  for (const key of ['ligues', 'ententes', 'clubs', 'athletes', 'coachs', 'arbitres', 'medecins', 'officiels']) {
    const old = await previous[`get${key[0].toUpperCase()}${key.slice(1)}`]()
    const pick = row => ['ligues', 'ententes', 'clubs'].includes(key) ? [row.id, row.nom, row.statut] : [row.id, row.nomComplet, row.genre, row.statut]
    assert.equal(JSON.stringify(result[key].map(pick)), JSON.stringify(old.map(pick)), key)
    if ('genre' in (result[key][0] || {})) assert.equal(JSON.stringify(metrics.summarizeDashboardActors(result[key])), JSON.stringify(metrics.summarizeDashboardActors(old)))
  }
})

test('une famille indisponible ne masque pas les autres acteurs', async () => {
  const h = harness({ ATHLETES: [{ id_athlete: 'A1', nom_complet: 'Test', statut: 'ACTIF' }] }, new Set(['COACHS']))
  const result = await h.load('lib/dashboard-directory.ts').loadDashboardDirectory()
  assert.equal(result.athletes.length, 1)
  assert.equal(result.coachs.length, 0)
})

test('la selection des cinq recents reste stable sans trier ni modifier toute la source', () => {
  const { latestDashboardRows } = harness().load('lib/dashboard-metrics.ts')
  const rows = Array.from({ length: 1000 }, (_, id) => ({ id, date: String((id * 37) % 113) }))
  const before = [...rows]
  const expected = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  assert.deepEqual([...latestDashboardRows(rows, row => row.date)].map(row => row.id), expected.map(row => row.id))
  assert.deepEqual(rows, before)
})

test('la validite de chaque licence est lue une seule fois', () => {
  const { calculateLicenceMetrics } = harness().load('lib/dashboard-metrics.ts')
  let reads = 0
  const rows = Array.from({ length: 100 }, () => ({ statutLicence: 'ACTIF', get dateFinValidite() { reads++; return '2099-12-31' } }))
  const result = calculateLicenceMetrics(rows)
  assert.equal(result.active, 100)
  assert.equal(reads, 100)
})
