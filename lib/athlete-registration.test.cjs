/* global require, console, Request */
/* eslint-disable @typescript-eslint/no-require-imports -- Full server command with an isolated Google API. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")
const key = "88888888-8888-4888-8888-888888888888"
const payload = () => ({ nomComplet: "Nouvel athlete", idSexe: "SEX001", dateDeNaissance: "02022000", clubId: "0101001", affiliationDate: "01012026", seasonId: "SAI006", idempotencyKey: key })
function setup() {
  const h = harness({ onboarding: true })
  const domain = h.loadModule("lib/athlete-registration.ts")
  const run = (body = payload(), date = "2026-11-18", user = "U1") => domain.runAthleteRegistration(h.createStore(), user, body, date)
  const api = h.loadModule("lib/athlete-registration-api.ts")
  return { ...h, domain, run, api }
}
function count(h, book, table) { return h.books[book].sheets[table].values.length - 1 }

test("nominal : identite, premiere affiliation et licence liees, zero initial et lecteur Licence", async () => {
  const h = setup(), result = await h.run()
  assert.equal(result.state, "COMPLETE")
  assert.equal(result.athlete.idAthlete, "ATH00003")
  assert.equal(result.athlete.clubId, "0101001")
  assert.equal(result.affiliation.athleteId, result.athlete.idAthlete)
  assert.equal(result.licence.idAffiliation, result.affiliation.id)
  assert.equal(result.licence.actorId, result.athlete.idAthlete)
  assert.equal(result.licence.idClubAttribution, "0101001")
  assert.equal(result.numeroLicence, "0101001001")
  const { activeActorLicenceNumbers } = h.loadModule("lib/active-actor-licences.ts")
  assert.equal(activeActorLicenceNumbers([result.licence], "2026-11-18").get("ATH00003"), result.numeroLicence)
  assert.equal(count(h, "ACT", "ATHLETES"), 3)
  assert.equal(count(h, "AFF", "ATHLETE_AFFILIATIONS"), 3)
  assert.equal(count(h, "LIC", "ATHLETE_LICENCES"), 1)
  assert.equal(h.books.LIC.sheets.COMPTEURS_LICENCES.values[1][3], "1")
  assert.equal(h.books.AFF.metadata.filter(m => m.metadataKey.includes("lock:")).length, 0)
  assert.ok(h.invalidations.some(row => row.book === "ACT"))
  console.log("Mesure commande complete :", JSON.stringify({ reads: h.reads.length, valuesReads: h.reads.filter(r => r.kind === "values").length, writes: h.calls.length, businessBatches: h.calls.filter(r => r.business).length }))
})

for (const book of ["ACT", "AFF", "LIC"]) test(`reprise apres echec avant application de l'etape ${book}`, async () => {
  const h = setup(); h.state.failBook = book
  await assert.rejects(h.run(), error => ["PARTIAL", "UNCERTAIN"].includes(error.state))
  const partial = [count(h, "ACT", "ATHLETES"), count(h, "AFF", "ATHLETE_AFFILIATIONS"), count(h, "LIC", "ATHLETE_LICENCES")]
  assert.deepEqual(partial, book === "ACT" ? [2, 2, 0] : book === "AFF" ? [3, 2, 0] : [3, 3, 0])
  h.state.failBook = ""
  const result = await h.run()
  assert.equal(result.state, "COMPLETE")
  assert.deepEqual([count(h, "ACT", "ATHLETES"), count(h, "AFF", "ATHLETE_AFFILIATIONS"), count(h, "LIC", "ATHLETE_LICENCES")], [3, 3, 1])
})

for (const book of ["ACT", "AFF", "LIC"]) test(`reponse perdue apres application ${book} : verification et reprise sans doublon`, async () => {
  const h = setup(); h.state.failAfterBook = book
  await assert.rejects(h.run())
  h.state.failAfterBook = ""; h.state.hideReceiptBook = ""
  const result = await h.run(payload(), "2026-11-19")
  assert.equal(result.licence.dateDelivrance, "2026-11-18")
  assert.deepEqual([count(h, "ACT", "ATHLETES"), count(h, "AFF", "ATHLETE_AFFILIATIONS"), count(h, "LIC", "ATHLETE_LICENCES")], [3, 3, 1])
})

test("requete repetee, double clic et autre operation : aucun doublon ni fusion", async () => {
  const h = setup()
  const attempts = await Promise.allSettled([h.run(), h.run()])
  assert.ok(attempts.some(row => row.status === "fulfilled"))
  const first = await h.run(), repeated = await h.run()
  assert.equal(first.athlete.idAthlete, repeated.athlete.idAthlete)
  assert.equal(count(h, "LIC", "ATHLETE_LICENCES"), 1)
  await assert.rejects(h.run({ ...payload(), idempotencyKey: "99999999-9999-4999-8999-999999999999" }), error => error.code === "DOUBLON_POTENTIEL" && error.existingAthleteId === first.athlete.idAthlete)
  await assert.rejects(h.run({ ...payload(), nomComplet: "Autre personne" }), error => error.code === "IDEMPOTENCE_CONFLIT")
  await assert.rejects(h.run(payload(), "2026-11-18", "U2"), error => error.code === "IDEMPOTENCE_CONFLIT")
})

test("deux nouvelles personnes concurrentes : identifiants et numeros uniques", async () => {
  const h = setup()
  const results = await Promise.all([h.run(), h.run({ ...payload(), nomComplet: "Autre athlete", idempotencyKey: "99999999-9999-4999-8999-999999999999" })])
  assert.equal(new Set(results.map(r => r.athlete.idAthlete)).size, 2)
  assert.equal(new Set(results.map(r => r.numeroLicence)).size, 2)
  assert.equal(count(h, "LIC", "ATHLETE_LICENCES"), 2)
})

for (const changes of [{ nomComplet: "" }, { idSexe: "INCONNU" }, { email: "invalide" }, { affiliationDate: "31022026" }, { dateDeNaissance: "31022000" }, { clubId: "INCONNU" }, { seasonId: "INCONNUE" }, { affiliationDate: "01012027" }, { numero_licence: "MANUEL" }, { id_athlete: "FORCE" }, { idempotencyKey: "" }]) test(`validation avant toute ecriture ${JSON.stringify(changes)}`, async () => {
  const h = setup(); await assert.rejects(h.run({ ...payload(), ...changes }))
  assert.equal(h.calls.length, 0)
})

for (const target of ["CLUBS", "ENTENTES", "LIGUES"]) test(`hierarchie inactive ${target} : aucune ecriture`, async () => {
  const h = setup(), values = h.books.TERR.sheets[target].values
  values[1][values[0].indexOf("statut")] = "INACTIF"
  await assert.rejects(h.run(), error => error.code === "CLUB_INTERDIT")
  assert.equal(h.calls.length, 0)
})

test("saison annulee ou parametre absent : aucune ecriture", async () => {
  const h = setup(); h.books.REF.sheets.SAISON.values[1][3] = "STS005"
  await assert.rejects(h.run()); assert.equal(h.calls.length, 0)
  h.books.REF.sheets.SAISON.values[1][3] = "STS002"
  h.books.REF.sheets.PARAMETRES_SYSTEME.values.pop()
  await assert.rejects(h.run()); assert.equal(h.calls.length, 0)
})

test("compteur bloque et colonnes absentes : pas d'identite isolee", async () => {
  const h = setup()
  h.books.LIC.sheets.COMPTEURS_LICENCES.values.push(["CPT-SAI006-0101001", "0101001", "SAI006", "999", "A_VERIFIER", ""])
  await assert.rejects(h.run(), error => error.code === "COMPTEUR_BLOQUE")
  assert.equal(h.calls.length, 0)
  h.books.LIC.sheets.COMPTEURS_LICENCES.values.pop()
  h.books.ACT.sheets.ATHLETES.values[0].splice(1, 1)
  await assert.rejects(h.run(), error => error.code === "SCHEMA_INCOMPLET")
  assert.equal(h.calls.length, 0)
})

test("compteur confirme : passage 999 a 1000 sans reutiliser le numero historique annule", async () => {
  const h = setup()
  h.books.LIC.sheets.ATHLETE_LICENCES.values.push(["OLD", "ATH00001", "SAI006", "AFA-000001", "0101001999", "2026-01-01", "STL005", "", "0101001", "999"])
  h.books.LIC.sheets.COMPTEURS_LICENCES.values.push(["CPT-SAI006-0101001", "0101001", "SAI006", "999", "PRET", ""])
  const result = await h.run()
  assert.equal(result.numeroLicence, "01010011000")
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values[1][4], "0101001999")
})

for (const flag of ["noSession", "activation", "denyWrite"]) test(`API autorisation ${flag} avant toute creation`, async () => {
  const h = setup(); h.state[flag] = true
  const request = new Request("http://localhost/api/athletes", { method: "POST", headers: { origin: "http://localhost", "content-type": "application/json" }, body: JSON.stringify(payload()) })
  const response = await h.api.registrationPOST(request)
  assert.equal(response.status, flag === "denyWrite" ? 403 : 401)
  assert.equal(h.calls.length, 0)
  assert.equal(h.reads.length, 0)
})
test("API conserve le controle d'origine", async () => {
  const h = setup(), response = await h.api.registrationPOST(new Request("http://localhost/api/athletes", { method: "POST", headers: { origin: "http://foreign.invalid" }, body: JSON.stringify(payload()) }))
  assert.equal(response.status, 403); assert.equal(h.calls.length, 0)
})

test("API reelle : reponse complete, options ciblees et invalidations", async () => {
  const h = setup(), options = await h.api.registrationGET()
  assert.equal(options.status, 200)
  assert.equal((await options.json()).currentSeasonId, "SAI006")
  assert.equal(h.reads.filter(row => row.kind === "cached-values").length, 2)
  const route = h.loadModule("app/api/athletes/route.ts")
  const response = await route.POST(new Request("http://localhost/api/athletes", { method: "POST", headers: { origin: "http://localhost" }, body: JSON.stringify(payload()) }))
  assert.equal(response.status, 201)
  const body = await response.json()
  assert.equal(body.numeroLicence, "0101001001")
  assert.equal(body.licence.actorId, body.athlete.idAthlete)
  assert.ok(h.invalidations.some(row => row.path === "/clubs"))
  assert.ok(h.invalidations.some(row => row.path === "/licences"))
})

test("pendant une reprise partielle, une autre operation ne prend pas le verrou de l'athlete", async () => {
  const h = setup(); h.state.failBook = "LIC"
  await assert.rejects(h.run())
  h.state.failBook = ""
  await assert.rejects(h.mutateAthleteTransfer("ATH00003", { id_type_transfert: "TRF003", id_club: "0101002", date_debut: "2026-11-18", date_fin: "", id_statut_affiliation: "SAF001", id_affiliation_precedente: "AFA-000003", idempotency_key: "99999999-9999-4999-8999-999999999999" }), error => error.code === "ATHLETE_RESERVE")
  assert.equal((await h.run()).state, "COMPLETE")
})

test("reprise : changement de saison par defaut sans substitution de la saison engagee", async () => {
  const h = setup(); h.state.failBook = "LIC"
  await assert.rejects(h.run())
  h.state.failBook = ""
  h.books.REF.sheets.PARAMETRES_SYSTEME.values.at(-1)[1] = "SAISON_PAR_DEFAUT_MODIFIEE"
  const result = await h.run()
  assert.equal(result.season.id, "SAI006")
})

test("parcours manuel retire : aucune delivrance independante apres rattachement", async () => {
  const h = setup()
  await assert.rejects(h.mutateSeasonalLicence({}), error => error.code === "RATTACHEMENT_REQUIS")
  assert.equal(h.calls.filter(call => call.business).length, 0)
})

test("modifier une identite ne cree aucune affiliation ni licence", async () => {
  let h
  const writes = []
  h = harness({ onboarding: true, overrides: {
    "@/lib/actor-references": { getActorSexes: async () => [{ id: "SEX001", nom: "MASCULIN" }] },
    "@/lib/data": { getAthletes: async () => {
      const [headers, ...values] = h.books.ACT.sheets.ATHLETES.values
      return values.map(row => h.loadModule("lib/mappers/athletes.ts").mapAthleteRow(Object.fromEntries(headers.map((key, index) => [key, row[index] || ""]))))
    } },
    "@/lib/google-sheets": { updateSheetRecordById: async (book, table, field, id, values) => {
      writes.push({ book, table, field, id, values })
    }, appendSheetRecord: async () => { throw new Error("Creation inattendue") } },
  } })
  const { updateAthlete } = h.loadModule("lib/athlete-mutations.ts")
  await updateAthlete("ATH00001", { nomComplet: "Identite corrigee", idSexe: "SEX001", telephone: "012345", dateDeNaissance: "" })
  assert.equal(writes.length, 1)
  assert.equal(writes[0].table, "ATHLETES")
  assert.equal(writes[0].id, "ATH00001")
  assert.equal(h.calls.length, 0)
  assert.equal(count(h, "LIC", "ATHLETE_LICENCES"), 0)
})
