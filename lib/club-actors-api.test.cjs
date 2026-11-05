/* global require, __dirname, Response, Request */
/* eslint-disable @typescript-eslint/no-require-imports -- Real route with synthetic source boundaries. */
const test = require("node:test"), assert = require("node:assert/strict")
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")

function harness({ sourceFailure = false, actorFailure = false, configured = true, empty = false } = {}) {
  const root = path.resolve(__dirname, ".."), calls = []
  const groups = { athletes: [], coachs: [], medecins: [], officiels: [], autres: [] }
  const mocks = {
    "next/server": { NextResponse: { json: (value, options) => new Response(JSON.stringify(value), { ...options, headers: { ...options?.headers, "Content-Type": "application/json" } }) } },
    "@/lib/env": { env: { googleSheets: { territorialSpreadsheetId: configured ? "TERR" : "", clientEmail: "test", privateKey: "test" } } },
    "@/lib/google-sheets": { getSheetsDataFrom: async () => { if (sourceFailure) throw new Error("Source unavailable"); return { CLUBS: [{ id_club: "0101" }] } } },
    "@/lib/club-actors": { loadClubActors: async id => { calls.push(id); if (actorFailure) throw new Error("Actors unavailable"); return { byClub: empty ? {} : { [id]: { ...groups, athletes: [{ id: "A", numeroLicence: "LIC-TEST" }] }, OTHER: { ...groups, athletes: [{ id: "PRIVATE" }] } }, ignoredRelations: 0 } } },
    "@/lib/club-actors-model": { emptyClubActors: () => groups },
  }
  const file = path.join(root, "app/api/clubs/[id]/actors/route.ts")
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => mocks[name] }, { filename: file })
  return { calls, request: id => exports.GET(new Request("http://localhost/api/clubs/0101/actors"), { params: Promise.resolve({ id }) }) }
}

test("API fiche club : identifiant conservé, réponse limitée au club et non mise en cache HTTP", async () => {
  const { request, calls } = harness()
  const response = await request("0101")
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("cache-control"), "private, no-store")
  const body = await response.json()
  assert.equal(body.actors.athletes[0].numeroLicence, "LIC-TEST")
  assert.equal(JSON.stringify(body).includes("PRIVATE"), false)
  assert.deepEqual(calls, ["0101"])
})
test("club inconnu : aucun chargement d'acteurs", async () => {
  const { request, calls } = harness()
  assert.equal((await request("UNKNOWN")).status, 404)
  assert.equal(calls.length, 0)
})
test("club vide : collections vides explicites", async () => {
  const response = await harness({ empty: true }).request("0101")
  assert.deepEqual((await response.json()).actors.athletes, [])
})
for (const options of [{ sourceFailure: true }, { actorFailure: true }, { configured: false }]) test(`panne source : 503 JSON (${JSON.stringify(options)})`, async () => {
  const response = await harness(options).request("0101")
  assert.equal(response.status, 503)
  assert.equal(response.headers.get("cache-control"), "private, no-store")
  assert.equal(typeof (await response.json()).message, "string")
})

test("la nouvelle route reste couverte par la politique sportive READ existante", () => {
  const source = fs.readFileSync(path.join(__dirname, "auth/route-policy.ts"), "utf8")
  const exports = {}
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports })
  const policy = exports.routePolicy("/api/clubs/0101/actors", "GET")
  assert.equal(policy.action, "READ")
  assert.deepEqual(Array.from(policy.blocks), ["AUT-SPT"])
})
