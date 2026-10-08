import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { createLicenceDomain, effectiveLicenceStatus, type LicenceStore } from "./licences-domain.ts"

test("modifier conserve identité, saison et affiliation et valide la date", async () => {
  const memory = store()
  memory.athleteLicences.push({ id_licence: "L1", id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-athlete", numero_licence: "OLD", date_delivrance: "2026-01-01", id_statut_licence: "STL001" })
  memory.updateAthlete = async (id, row) => { memory.athleteLicences[memory.athleteLicences.findIndex(item => item.id_licence === id)] = row }
  const domain = createLicenceDomain(memory)
  await assert.rejects(() => domain.updateAthlete("L1", { numero_licence: "NEW", date_delivrance: "31/02/2026", id_statut_licence: "STL001" }))
  const row = await domain.updateAthlete("L1", { numero_licence: "NEW", date_delivrance: "08/10/2026", id_statut_licence: "STL001", id_athlete: "OTHER" })
  assert.equal(row.id_athlete, "ATH001"); assert.equal(row.id_saison, "SAI001"); assert.equal(row.id_affiliation_athlete, "AFF-athlete"); assert.equal(row.date_delivrance, "2026-10-08"); assert.equal(memory.athleteLicences.length, 1)
})

test("renouvelle par club avec le numéro précédent et ajoute une seule fois", async () => {
  const memory = store(), baseAffiliation = memory.affiliation
  memory.affiliation = async (kind, id) => { const row = await baseAffiliation(kind, id); return row && { ...row, clubId: "CL1" } }
  memory.athleteLicences.push({ id_licence: "OLD", id_athlete: "ATH001", id_saison: "OLD", numero_licence: "123", date_delivrance: "2025-09-01" })
  const input = { id_club: "CL1", id_saison: "SAI001", id_affiliations_athletes: ["AFF-athlete"], date_delivrance: "08/10/2026", id_statut_licence: "STL001" }
  const result = await createLicenceDomain(memory).renewClub(input)
  assert.equal(result[0].numero_licence, "123"); assert.equal(result[0].date_delivrance, "2026-10-08"); assert.equal(memory.athleteLicences.length, 2)
  await assert.rejects(() => createLicenceDomain(memory).renewClub(input)); assert.equal(memory.athleteLicences.length, 2)
})

test("renouvellement refuse un autre club, une première licence et un doublon avant toute écriture", async () => {
  const memory = store(), baseAffiliation = memory.affiliation
  memory.affiliation = async (kind, id) => { const row = await baseAffiliation(kind, id); return row && { ...row, clubId: "CL1" } }
  const input = { id_club: "CL1", id_saison: "SAI001", id_affiliations_athletes: ["AFF-athlete"], date_delivrance: "08/10/2026", id_statut_licence: "STL001" }
  await assert.rejects(() => createLicenceDomain(memory).renewClub({ ...input, id_club: "CL2" })); await assert.rejects(() => createLicenceDomain(memory).renewClub(input)); assert.equal(memory.athleteLicences.length, 0)
  memory.athleteLicences.push({ id_licence: "OLD", id_athlete: "ATH001", id_saison: "OLD", numero_licence: "123", date_delivrance: "2025-09-01" })
  await assert.rejects(() => createLicenceDomain(memory).renewClub({ ...input, id_affiliations_athletes: ["AFF-athlete", "AFF-athlete"] })); assert.equal(memory.athleteLicences.length, 1)
})

function store(): LicenceStore & { athleteLicences: Record<string, string>[]; actorLicences: Record<string, string>[] } {
  const athleteLicences: Record<string, string>[] = [], actorLicences: Record<string, string>[] = []
  return {
    athleteLicences, actorLicences,
    async load() { return { athleteLicences, actorLicences } },
    async appendAthlete(rows) { athleteLicences.push(...rows) }, async appendActor(row) { actorLicences.push(row) },
    async athleteExists(id) { return id === "ATH001" }, async actorExists(type, id) { return ({ TAC002: "COA001", TAC003: "OFF001", TAC004: "ARB001", TAC005: "MED001" }[type] === id) },
    async seasonExists(id) { return id === "SAI001" }, async cycleExists(id) { return ["CYC001", "CYC002"].includes(id) }, async statusExists(id) { return id === "STL001" },
    async affiliation(kind, id) { if (id !== `AFF-${kind}`) return null; return { id, actorId: kind === "athlete" ? "ATH001" : ({ coach: "COA001", officiel: "OFF001", medecin: "MED001" } as Record<string, string>)[kind], activeFrom: "2026-01-01", activeUntil: "", statusId: "SAF001", targetExists: true } },
  }
}

test("crée une licence saisonnière depuis une affiliation active", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  const row = await domain.createAthlete({ id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-athlete", numero_licence: "123", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }, "2026-09-01")
  assert.equal(row.id_licence, "VOL-LIC-2026-000001")
})

test("autorise une licence depuis une affiliation existante même terminée", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  memory.affiliation = async (_kind, id) => id === "AFF-HISTORIQUE" ? { id, actorId: "ATH001", activeFrom: "2024-01-01", activeUntil: "2024-12-31", statusId: "SAF002", targetExists: false } : null
  const row = await domain.createAthlete({ id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-HISTORIQUE", numero_licence: "124", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }, "2026-09-01")
  assert.equal(row.id_affiliation_athlete, "AFF-HISTORIQUE")
})

test("refuse une affiliation appartenant à un autre athlète", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  memory.affiliation = async (_kind, id) => ({ id, actorId: "ATH999", activeFrom: "2026-01-01", activeUntil: "", statusId: "SAF001", targetExists: true })
  await assert.rejects(() => domain.createAthlete({ id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-AUTRE", numero_licence: "125", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }, "2026-09-01"), (error: unknown) => error instanceof Error && "code" in error && error.code === "AFFILIATION_INADMISSIBLE")
})

test("refuse une deuxième licence pour le même athlète et la même saison", async () => {
  const memory = store(), domain = createLicenceDomain(memory), command = { id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-athlete", numero_licence: "123", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }
  await domain.createAthlete(command, "2026-09-01")
  await assert.rejects(() => domain.createAthlete(command, "2026-09-01"), (error: unknown) => error instanceof Error && "code" in error && error.code === "LICENCE_EXISTANTE")
})

test("autorise l’arbitre sans affiliation et refuse une fausse affiliation", async () => {
  const memory = store(), domain = createLicenceDomain(memory), base = { id_type_acteur: "TAC004", id_acteur: "ARB001", id_cycle_licence: "CYC001", numero_licence: "ARB-9", date_delivrance: "01/01/2026", date_debut_validite: "01/01/2026", date_fin_validite: "31/12/2026", id_statut_licence: "STL001", observations: "" }
  const row = await domain.createActor({ ...base, id_affiliation_acteur: "" })
  assert.equal(row.id_affiliation_acteur, "")
  await assert.rejects(() => domain.createActor({ ...base, numero_licence: "ARB-10", id_affiliation_acteur: "AFF-arbitre" }), /ne doit pas avoir d’affiliation/i)
})

test("calcule les statuts temporels et conserve la priorité manuelle", () => {
  assert.equal(effectiveLicenceStatus("ACTIVE", "2026-10-01", "2027-09-30", "2026-09-01"), "A_VENIR")
  assert.equal(effectiveLicenceStatus("ACTIVE", "2026-01-01", "2026-12-31", "2026-09-01"), "VALIDE")
  assert.equal(effectiveLicenceStatus("ACTIVE", "2025-01-01", "2025-12-31", "2026-09-01"), "EXPIREE")
  assert.equal(effectiveLicenceStatus("SUSPENDUE", "2026-01-01", "2026-12-31", "2026-09-01"), "SUSPENDUE")
})

const coachLicence = { id_type_acteur: "TAC002", id_acteur: "COA001", id_affiliation_acteur: "AFF-coach", id_cycle_licence: "CYC001", numero_licence: "CO-001", date_delivrance: "01/01/2026", date_debut_validite: "01/01/2026", date_fin_validite: "31/12/2026", id_statut_licence: "STL001", observations: "" }

test("licence entourage : dates canoniques, identifiant VOL et affiliation conservée", async () => {
  const memory = store(), row = await createLicenceDomain(memory).createActor(coachLicence)
  assert.equal(row.id_licence, "VOL-ACL-2026-000001")
  assert.equal(row.date_delivrance, "2026-01-01")
  assert.equal(row.id_affiliation_acteur, "AFF-coach")
  assert.equal(memory.actorLicences.length, 1)
})

test("licence entourage : refuse affiliation étrangère, suspendue, future ou structure absente", async () => {
  for (const override of [{ actorId: "OTHER" }, { statusId: "SAF003" }, { activeFrom: "2027-01-01" }, { activeUntil: "2025-12-31" }, { targetExists: false }]) {
    const memory = store(), original = memory.affiliation
    memory.affiliation = async (kind, id) => { const row = await original(kind, id); return row && { ...row, ...override } }
    await assert.rejects(() => createLicenceDomain(memory).createActor(coachLicence), /affiliation active/i)
    assert.equal(memory.actorLicences.length, 0)
  }
})

test("licence entourage : refuse référence et dates invalides avant écriture", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  for (const override of [{ id_cycle_licence: "UNKNOWN" }, { id_statut_licence: "UNKNOWN" }, { id_type_acteur: "TAC001" }, { date_fin_validite: "31/02/2026" }, { date_delivrance: "02/01/2026" }, { date_fin_validite: "31/12/2025" }]) await assert.rejects(() => domain.createActor({ ...coachLicence, ...override }))
  assert.equal(memory.actorLicences.length, 0)
})

test("renouvellement entourage : refuse chevauchement inclusif et accepte le jour suivant", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  await domain.createActor(coachLicence)
  await assert.rejects(() => domain.createActor({ ...coachLicence, date_debut_validite: "31/12/2026", date_fin_validite: "31/12/2027" }), /chevauche/i)
  await domain.createActor({ ...coachLicence, date_debut_validite: "01/01/2027", date_fin_validite: "31/12/2027" })
  assert.equal(memory.actorLicences.length, 2)
  assert.notEqual(memory.actorLicences[0].id_licence, memory.actorLicences[1].id_licence)
})

test("modification entourage : conserve identifiant et acteur, contrôle le chevauchement", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  memory.updateActor = async (id, row) => { memory.actorLicences[memory.actorLicences.findIndex(item => item.id_licence === id)] = row }
  const original = await domain.createActor(coachLicence)
  const row = await domain.updateActor(original.id_licence, { ...coachLicence, id_acteur: "OTHER", numero_licence: "NEW" })
  assert.equal(row.id_licence, original.id_licence); assert.equal(row.id_acteur, "COA001"); assert.equal(row.numero_licence, "NEW")
  await domain.createActor({ ...coachLicence, date_debut_validite: "01/01/2027", date_fin_validite: "31/12/2027" })
  await assert.rejects(() => domain.updateActor(original.id_licence, { ...coachLicence, date_fin_validite: "01/01/2027" }), /chevauche/i)
  assert.equal(memory.actorLicences[0].date_fin_validite, "2026-12-31")
})

test("transitions entourage : suspension, réactivation, clôture et annulation contrôlées", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  memory.statusExists = async id => ["STL001", "STL003", "STL004", "STL005"].includes(id)
  memory.updateActor = async (id, row) => { memory.actorLicences[memory.actorLicences.findIndex(item => item.id_licence === id)] = row }
  const original = await domain.createActor(coachLicence)
  assert.equal((await domain.transitionActor(original.id_licence, "suspend", "2026-10-08")).id_statut_licence, "STL003")
  assert.equal((await domain.transitionActor(original.id_licence, "reactivate", "2026-10-08")).id_statut_licence, "STL001")
  assert.equal((await domain.transitionActor(original.id_licence, "close", "2026-10-08")).id_statut_licence, "STL004")
  await assert.rejects(() => domain.transitionActor(original.id_licence, "reactivate", "2026-10-08"))
  assert.equal((await domain.transitionActor(original.id_licence, "cancel", "2026-10-08")).id_statut_licence, "STL005")
  await assert.rejects(() => domain.transitionActor(original.id_licence, "cancel", "2026-10-08"))
})
