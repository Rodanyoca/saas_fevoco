/* global require, __dirname, console, process */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness renders the actual TSX components. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const root = path.resolve(__dirname, '..')
const cache = new Map()
function load(file) {
  file = ['.tsx', '.ts', ''].map(ext => file + ext).find(candidate => fs.existsSync(candidate))
  if (cache.has(file)) return cache.get(file)
  const exports = {}
  cache.set(file, exports)
  const requireLocal = name => name === 'next/navigation' ? { useRouter: () => ({ refresh() {} }) } : name.startsWith('@/') ? load(path.join(root, name.slice(2))) : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name)
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, { exports, require: requireLocal, console, process })
  return exports
}
const { CompetitionMatchCards, CompetitionResultCards } = load(path.join(root, 'components/competitions/competition-play-cards'))
const props = () => ({ matches: [{ id_match: 'M1', id_phase_competition: 'P1', id_groupe: 'G1', id_unite_a: 'U1', id_unite_b: 'U2', date_match: '2026-10-09', heure_match: '18:00', statut_match: 'PROGRAMME' }], results: [], phases: [{ id_phase_competition: 'P1', nom_phase: 'Finale' }], groups: [{ id_groupe: 'G1', nom_groupe: 'Groupe A' }], unitLabels: { U1: 'Club A', U2: 'Club B' } })
test('result card preserves zero sets, resolves labels, and shows only played sets', () => {
  const data = props()
  data.results = [{ id_resultat: 'R1', id_match: 'M1', id_statut_resultat: 'STR001', sets_gagnes_a: '3', sets_gagnes_b: '0', id_unite_vainqueur: 'U1', set_1_a: '25', set_1_b: '0', set_2_a: '25', set_2_b: '18', set_3_a: '25', set_3_b: '20', set_4_a: '', set_4_b: '' }]
  const html = renderToStaticMarkup(React.createElement(CompetitionResultCards, { ...data, statuses: [{ id: 'STR001', label: 'JOUE' }] }))
  assert.match(html, /Club A/); assert.match(html, /Club B/); assert.match(html, /Finale/); assert.match(html, /Groupe A/)
  assert.match(html, />0<\/strong>/); assert.match(html, /25–0/); assert.match(html, /Set 3/); assert.doesNotMatch(html, /Set 4|STR001|qt1|QT1/)
  assert.match(html, /lucide-trophy/)
})
test('cancelled result is displayed as cancelled in the match card', () => {
  const data = props(); data.results = [{ id_match: 'M1', id_statut_resultat: 'STR005' }]
  const html = renderToStaticMarkup(React.createElement(CompetitionMatchCards, data))
  assert.match(html, /Club A/); assert.match(html, /Club B/); assert.match(html, /VS/); assert.match(html, /18:00/)
  assert.match(html, /Annul|ANNULE/i); assert.doesNotMatch(html, /JOUE/)
})
test('administrative results show their label without displaying set details', () => {
  const data = props(); data.results = [{ id_resultat: 'R2', id_match: 'M1', id_statut_resultat: 'STR005', set_1_a: '25', set_1_b: '0' }]
  const html = renderToStaticMarkup(React.createElement(CompetitionResultCards, { ...data, statuses: [{ id: 'STR005', label: 'ANNULE' }] }))
  assert.match(html, /Annul|ANNULE/i); assert.doesNotMatch(html, /Set 1|25–0|lucide-trophy/)
})

const { CompetitionPhasePanel } = load(path.join(root, 'components/competitions/competition-phase-panel'))
test('phase panel groups phases by event, counts distinct active units and resolves reference labels', () => {
  const data = { competitionId: 'C1', closed: false, references: { TYPES_PHASES: [{ id: 'TP1', label: 'Phase finale' }], MODES_PHASES: [{ id: 'MPH001', label: 'GROUPES' }] }, events: [{ id_epreuve_competition: 'E1', nom_epreuve: 'Indoor', statut: 'ACTIF' }], phases: [{ id_phase_competition: 'P1', id_epreuve_competition: 'E1', nom_phase: 'Poules', numero_phase: '1', id_type_phase: 'TP1', id_mode_phase: 'MPH001', statut: 'ACTIF' }], groups: [{ id_groupe: 'G1', id_phase_competition: 'P1', nom_groupe: 'Groupe A', statut: 'ACTIF' }], assignments: [{ id_phase_competition: 'P1', id_unite_competition: 'U1', statut: 'ACTIF' }, { id_phase_competition: 'P1', id_unite_competition: 'U1', statut: 'ACTIF' }, { id_phase_competition: 'P1', id_unite_competition: 'U2', statut: 'INACTIF' }], matches: [{ id_phase_competition: 'P1' }] }
  const html = renderToStaticMarkup(React.createElement(CompetitionPhasePanel, data))
  assert.match(html, /Indoor/); assert.match(html, /1\. Poules/); assert.match(html, /Phase finale/); assert.match(html, /Groupe A/)
  assert.match(html, /1 unit/); assert.match(html, /1 match/); assert.equal((html.match(/<form/g) || []).length, 2)
  const closed = renderToStaticMarkup(React.createElement(CompetitionPhasePanel, { ...data, closed: true }))
  assert.doesNotMatch(closed, /<form|Ajouter la phase/); assert.match(closed, /Groupe A/)
})
