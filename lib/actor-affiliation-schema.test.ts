import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { affiliationSheets, affiliationView, readAffiliationRow, writeAffiliationRow, type AffiliationReferences } from "./actor-affiliation-schema.ts"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { formatDateForSheet } from "./compact-date.ts"

const statuses = [{ id: "status-active", label: "ACTIF" }]
const refs: AffiliationReferences = { clubs: [{ id: "C1", label: "Club A" }], statuses, functions: [{ id: "FN", label: "Président" }], entityTypes: [{ id: "TYPE", label: "LIGUE" }], entities: { TYPE: [{ id: "L1", label: "Ligue A" }] }, seasons: [{ id: "SEASON", label: "2026-2027" }] }

test("lit et écrit les en-têtes réels des cinq feuilles sans dépendre de leur ordre", () => {
  for (const kind of Object.keys(affiliationSheets) as Array<keyof typeof affiliationSheets>) {
    const config = affiliationSheets[kind]
    const source = { observations: "Note", date_fin: "", [config.actor]: "ACTOR", date_debut: "07/10/2026", [config.id]: "AFF", ...(kind === "autre" ? { statut_affiliation: "ACTIF", id_saison: "SEASON" } : { id_statut_affiliation: "status-active" }), ...(kind === "officiel" || kind === "autre" ? { id_type_entite: "TYPE", id_entite: "L1" } : { id_club: "C1" }), ...(kind === "officiel" ? { id_fonction: "FN" } : {}) }
    const row = readAffiliationRow(kind, source, statuses, formatDateForSheet), written = writeAffiliationRow(row, "ACTIF")
    assert.equal(row.dateDebut, "2026-10-07")
    assert.equal(row.statusId, "status-active")
    assert.deepEqual(Object.keys(written).sort(), Object.keys(source).sort())
    assert.equal(written[config.actor], "ACTOR")
    assert.equal(written.date_debut, "2026-10-07")
    assert.equal(written.date_fin, "")
    assert.equal(affiliationView(row, refs).structure, kind === "officiel" || kind === "autre" ? "Ligue A" : "Club A")
    assert.equal(affiliationView(row, refs).statut, "ACTIF")
  }
})

test("une référence absente reste signalée sans inventer un libellé", () => {
  const row = readAffiliationRow("athlete", { id_affiliation_athlete: "AFF", id_athlete: "A", id_club: "INCONNU", id_statut_affiliation: "INVALIDE" }, statuses, formatDateForSheet)
  const view = affiliationView(row, refs)
  assert.equal(view.structure, "")
  assert.equal(view.statut, "Statut inconnu")
  assert.match(view.anomaly, /Structure introuvable/)
  assert.match(view.anomaly, /Statut introuvable/)
})
