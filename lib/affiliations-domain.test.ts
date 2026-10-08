import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { createAffiliationDomain, type AffiliationRow, type AffiliationStore } from "./affiliations-domain.ts"

function memoryStore(seed: AffiliationRow[] = []): AffiliationStore & { rows: AffiliationRow[] } {
  const rows = structuredClone(seed)
  return {
    rows,
    async list() { return structuredClone(rows) },
    async save(row) { const index = rows.findIndex((item) => item.id === row.id); if (index < 0) rows.push(structuredClone(row)); else rows[index] = structuredClone(row) },
    async actorExists(kind, id) { return id === `${kind}-1` },
    async clubExists(id) { return id === "club-1" },
    async entityExists(typeId, id) { return typeId === "STR001" && id === "ligue-1" },
    async statusExists(id) { return ["SAF001", "SAF002"].includes(id) },
    async officialFunctionExists(id) { return id === "FON001" },
    async statusLabel(id) { return id === "SAF002" ? "TERMINE" : "ACTIF" },
    async seasonExists(id) { return id === "season-1" },
  }
}

test("crée une affiliation d’athlète à un club", async () => {
  const store = memoryStore(), domain = createAffiliationDomain(store)
  const result = await domain.create("athlete", "athlete-1", { id_club: "club-1", date_debut: "01/09/2026", date_fin: "", id_statut_affiliation: "SAF001", observations: "" })
  assert.equal(result.row.id, "AFA-000001")
  assert.equal(result.row.dateDebut, "2026-09-01")
  assert.equal(store.rows.length, 1)
})

test("une commande identique est idempotente", async () => {
  const store = memoryStore(), domain = createAffiliationDomain(store)
  const command = { id_club: "club-1", date_debut: "01/09/2026", date_fin: "", id_statut_affiliation: "SAF001", observations: "" }
  await domain.create("athlete", "athlete-1", command)
  const second = await domain.create("athlete", "athlete-1", command)
  assert.equal(second.created, false)
  assert.equal(store.rows.length, 1)
})

test("refuse les périodes inclusivement chevauchantes", async () => {
  const store = memoryStore([{ id: "AFA-000001", kind: "athlete", actorId: "athlete-1", clubId: "club-1", entityTypeId: "", entityId: "", functionId: "", dateDebut: "2026-09-01", dateFin: "2026-09-30", statusId: "SAF001", observations: "" }])
  const domain = createAffiliationDomain(store)
  await assert.rejects(() => domain.create("athlete", "athlete-1", { id_club: "club-1", date_debut: "30/09/2026", date_fin: "31/10/2026", id_statut_affiliation: "SAF001", observations: "autre" }), (error: unknown) => error instanceof Error && "code" in error && error.code === "CHEVAUCHEMENT")
})

test("refuse une affiliation d’arbitre", async () => {
  const domain = createAffiliationDomain(memoryStore())
  await assert.rejects(() => domain.create("arbitre" as never, "arbitre-1", {}), /pas pris en charge/i)
})

test("crée les affiliations coach, médecin, officiel et autre selon leurs références", async () => {
  const store = memoryStore(), domain = createAffiliationDomain(store)
  const dates = { date_debut: "07102026", date_fin: "", id_statut_affiliation: "SAF001" }
  for (const kind of ["coach", "medecin"] as const) {
    const result = await domain.create(kind, `${kind}-1`, { ...dates, id_club: "club-1" })
    assert.equal(result.row.clubId, "club-1")
    assert.equal(result.row.dateDebut, "2026-10-07")
  }
  const official = await domain.create("officiel", "officiel-1", { ...dates, id_type_entite: "STR001", id_entite: "ligue-1", id_fonction: "FON001" })
  assert.equal(official.row.functionId, "FON001")
  const other = await domain.create("autre", "autre-1", { ...dates, id_type_entite: "STR001", id_entite: "ligue-1", id_saison: "season-1" })
  assert.equal(other.row.seasonId, "season-1")
})

test("valide les dates civiles, leur ordre et la fin d’une affiliation terminée", async () => {
  const domain = createAffiliationDomain(memoryStore())
  const base = { id_club: "club-1", id_statut_affiliation: "SAF001" }
  for (const dates of [{ date_debut: "31022026" }, { date_debut: "29022026" }, { date_debut: "07102026", date_fin: "06102026" }, { date_debut: "07102026", id_statut_affiliation: "SAF002" }]) {
    await assert.rejects(() => domain.create("athlete", "athlete-1", { ...base, ...dates }), /corriger|fin est obligatoire/i)
  }
  const valid = await domain.create("athlete", "athlete-1", { ...base, date_debut: "29/02/2028" })
  assert.equal(valid.row.dateDebut, "2028-02-29")
})

test("refuse les acteurs, clubs, statuts, fonctions et entités inconnus", async () => {
  const domain = createAffiliationDomain(memoryStore()), base = { date_debut: "07102026", id_statut_affiliation: "SAF001", id_club: "club-1" }
  await assert.rejects(() => domain.create("athlete", "autre-acteur", base), /Acteur introuvable/)
  await assert.rejects(() => domain.create("athlete", "athlete-1", { ...base, id_club: "inconnu" }), /Club introuvable/)
  await assert.rejects(() => domain.create("athlete", "athlete-1", { ...base, id_statut_affiliation: "inconnu" }), /Statut inconnu/)
  await assert.rejects(() => domain.create("officiel", "officiel-1", { ...base, id_fonction: "inconnu" }), /Fonction inconnue/)
  await assert.rejects(() => domain.create("officiel", "officiel-1", { ...base, id_fonction: "FON001", id_type_entite: "CLUB", id_entite: "ligue-1" }), /Entité incompatible/)
})

test("une modification conserve la ligne et ne peut cibler l’affiliation d’un autre acteur", async () => {
  const store = memoryStore(), domain = createAffiliationDomain(store)
  const result = await domain.create("athlete", "athlete-1", { id_club: "club-1", date_debut: "07102026", id_statut_affiliation: "SAF001" })
  await domain.update("athlete", "athlete-1", result.row.id, { id_club: "club-1", date_debut: "07102026", date_fin: "08102026", id_statut_affiliation: "SAF002" })
  assert.equal(store.rows.length, 1)
  assert.equal(store.rows[0].id, result.row.id)
  assert.equal(store.rows[0].statusId, "SAF002")
  await assert.rejects(() => domain.update("coach", "coach-1", result.row.id, { id_club: "club-1", date_debut: "07102026", id_statut_affiliation: "SAF001" }), /Affiliation introuvable/)
})
