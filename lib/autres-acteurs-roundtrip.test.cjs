/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports -- Run the real server modules with an in-memory Sheets API. */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")

// Actual AUTRES headers, including the physical capital O in Observations.
const headers = ["id_autre_acteur", "nom_complet", "id_sexe", "date_naissance", "nationalite", "telephone", "email", "entite", "type_autre_acteur", "statut", "Observations", "role", "lieu_de_naissance", "adresse", "numero_passeport", "date_de_delivrance_passeport", "date_expiration_passeport", "avatar_drive_id", "avatar_drive_url", "passeport_drive_id", "passeport_drive_url"]

function harness(reordered = false) {
  const actorHeaders = reordered ? [...headers].reverse() : [...headers]
  const table = [actorHeaders]
  const tables = {
    AUTRES: table,
    SEXES: [["id_sexe", "nom_sexe"], ["SEX001", "MASCULIN"]],
    TYPES_AUTRES_ACTEURS: [["id_type_autre_acteur", "nom_type_autre_acteur", "observations", "statut"], ["TAU001", "PERSONNE DE CONTACT", "", "ACTIF"], ["TAU099", "AUTRE", "", "ACTIF"]],
  }
  const calls = []
  const valuesFor = range => {
    const [name, cells] = range.split("!")
    assert.ok(name in tables, `Unexpected sheet: ${name}`)
    return cells === "1:1" ? [tables[name][0]] : tables[name]
  }
  const sheets = { spreadsheets: {
    get: async () => ({ data: { sheets: [{ properties: { title: "AUTRES", sheetId: 1 } }] } }),
    batchUpdate: async args => { calls.push({ format: args }); return { data: {} } },
    values: {
      get: async ({ range }) => ({ data: { values: valuesFor(range) } }),
      batchGet: async ({ ranges }) => ({ data: { valueRanges: ranges.map(range => ({ values: valuesFor(range) })) } }),
      append: async args => {
        assert.match(args.range, /^AUTRES!/)
        table.push(...args.requestBody.values)
        calls.push({ append: args })
        return { data: {} }
      },
      update: async args => {
        assert.match(args.range, /^AUTRES!/)
        const row = Number(args.range.match(/!A(\d+):/)[1]) - 1
        table[row] = args.requestBody.values[0]
        calls.push({ update: args })
        return { data: {} }
      },
    },
  } }
  const mocks = {
    "server-only": {},
    "@/lib/env": { env: { googleSheets: { acteursSpreadsheetId: "ACT", referentielsSpreadsheetId: "REF", clientEmail: "test", privateKey: "test" } }, isGoogleSheetsConfigured: () => true },
    "next/cache": { unstable_cache: fn => fn, revalidateTag() {} },
    googleapis: { google: { auth: { JWT: class {} }, sheets: () => sheets } },
    // Keep the real form controls; expose the normally closed Sheet for static rendering.
    "@/components/ui/sheet": Object.fromEntries(["Sheet", "SheetContent", "SheetTrigger", "SheetHeader", "SheetFooter", "SheetTitle", "SheetDescription"].map(name => [name, ({ children }) => React.createElement("div", null, children)])),
  }
  const modules = new Map()
  function load(file) {
    file = path.resolve(file)
    if (modules.has(file)) return modules.get(file)
    const exports = {}
    modules.set(file, exports)
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
    const resolve = base => load(fs.existsSync(base + ".ts") ? base + ".ts" : base + ".tsx")
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? resolve(name.slice(2)) : name.startsWith(".") ? resolve(path.resolve(path.dirname(file), name)) : require(name)
    vm.runInNewContext(code, { exports, require: req, console, process, setTimeout, clearTimeout, setImmediate, Date }, { filename: file })
    return exports
  }
  return {
    api: load("lib/autres-acteurs-mutations.ts"),
    read: load("lib/autres-acteurs.ts").loadAutresActeurs,
    dates: load("lib/compact-date.ts"),
    row: index => Object.fromEntries(actorHeaders.map((header, column) => [header, table[index][column] ?? ""])),
    patch: (index, fields) => { for (const [key, value] of Object.entries(fields)) table[index][actorHeaders.indexOf(key)] = value },
    calls,
    load,
  }
}

for (const reordered of [false, true]) test(`AUTRES create/reopen/edit preserves FEVOCO fields, reordered headers=${reordered}`, async () => {
  const h = harness(reordered)
  const created = await h.api.createAutreActeur({
    nomComplet: "Acteur de test", idSexe: "SEX001", dateNaissance: "27/09/1990", nationalite: "CONGOLAISE",
    telephone: "+243999111222", email: "acteur@example.test", entite: " Institution ", role: " Coordination ",
    idTypeAutreActeur: "TAU001", observations: "Note\nDeuxième ligne", lieuNaissance: "Goma", adresse: "Adresse de test",
    numeroPasseport: "TEST-ONLY", dateDelivrancePasseport: "01/01/2025", dateExpirationPasseport: "01/01/2030",
  })
  assert.equal(created.idAutreActeur, "AUT00001")
  assert.equal(created.entite, "Institution")
  assert.equal(created.role, "Coordination")
  assert.equal(created.dateNaissance, "1990-09-27")
  assert.equal(created.idTypeAutreActeur, "TAU001")
  assert.equal(created.typeAutreActeur, "Personne de contact")
  assert.equal(h.row(1).type_autre_acteur, "TAU001")
  assert.equal(h.row(1).Observations, "Note\nDeuxième ligne")
  assert.equal(h.row(1).date_naissance, "1990-09-27")
  h.patch(1, { avatar_drive_id: "avatar-test", avatar_drive_url: "https://example.test/avatar", passeport_drive_id: "passport-test", passeport_drive_url: "https://example.test/passport" })
  const reopened = (await h.read()).acteurs[0]
  const before = h.row(1)
  const edited = await h.api.updateAutreActeur(reopened.idAutreActeur, { role: "Direction" })
  assert.equal(edited.role, "Direction")
  assert.equal(edited.entite, "Institution")
  for (const key of headers.filter(key => key !== "role")) assert.equal(h.row(1)[key], before[key], key)
  await h.api.updateAutreActeur(reopened.idAutreActeur, { entite: "Autre institution" })
  const reread = (await h.read()).acteurs[0]
  assert.equal(reread.entite, "Autre institution")
  assert.equal(reread.role, "Direction")
  assert.equal(reread.passeportDriveId, "passport-test")
  assert.equal(reread.lieuNaissance, "Goma")
  assert.equal(h.dates.compactDateFromSheet(reread.dateNaissance), "27/09/1990")
  assert.ok(h.calls.some(call => call.format?.requestBody.requests.some(request => request.repeatCell.range.startColumnIndex === (reordered ? headers.length - 4 : 3) && request.repeatCell.cell.userEnteredFormat.numberFormat.pattern === "yyyy-mm-dd")))
  const beforeInvalid = h.calls.length
  await assert.rejects(h.api.updateAutreActeur(reopened.idAutreActeur, { dateNaissance: "31/02/2000" }))
  await assert.rejects(h.api.updateAutreActeur(reopened.idAutreActeur, { dateNaissance: "01/01/2099" }))
  assert.equal(h.calls.length, beforeInvalid)
})

test("Entité/Rôle remain optional, type codes and TAU099 observations stay validated", async () => {
  const h = harness()
  const created = await h.api.createAutreActeur({ nomComplet: "Test", idSexe: "SEX001", idTypeAutreActeur: "TAU001" })
  assert.equal(created.entite, "")
  assert.equal(created.role, "")
  assert.equal(h.row(1).date_naissance, "")
  await assert.rejects(h.api.updateAutreActeur(created.idAutreActeur, { idTypeAutreActeur: "Personne de contact" }))
  await assert.rejects(h.api.updateAutreActeur(created.idAutreActeur, { idTypeAutreActeur: "TAU099", observations: "" }))
  const edited = await h.api.updateAutreActeur(created.idAutreActeur, { idTypeAutreActeur: "TAU099", observations: "Partenaire" })
  assert.equal(edited.idTypeAutreActeur, "TAU099")
  assert.equal(edited.typeAutreActeur, "Autre")
  assert.equal(h.row(1).type_autre_acteur, "TAU099")
})

test("create/edit forms render optional text fields in FEBACO sections and prefill saved values", async () => {
  const h = harness()
  const { AutreActeurFormDialog } = h.load("components/autres-acteurs/autre-acteur-form-dialog.tsx")
  const bundle = await h.read()
  const created = await h.api.createAutreActeur({ nomComplet: "Test", idSexe: "SEX001", idTypeAutreActeur: "TAU001", entite: "Institution", role: "Coordination", dateNaissance: "27/09/1990" })
  for (const acteur of [undefined, created]) {
    const html = renderToStaticMarkup(React.createElement(AutreActeurFormDialog, { acteur, sexes: bundle.sexes, types: bundle.types, onSaved() {} }))
    assert.doesNotMatch(html, /id="autre-(?:numeroPasseport|dateDelivrancePasseport|dateExpirationPasseport)"/)
    assert.doesNotMatch(html, /<legend[^>]*>Passeport<\/legend>/)
    for (const [key, expected] of [["entite", acteur?.entite ?? ""], ["role", acteur?.role ?? ""]]) {
      const control = html.match(new RegExp(`<input[^>]*id="autre-${key}"[^>]*>`))?.[0]
      assert.ok(control, `${key}: input rendered`)
      assert.match(control, /type="text"/)
      assert.ok(!control.includes("required"), `${key}: optional`)
      assert.ok(control.includes(`value="${expected}"`), `${key}: saved value prefilled`)
    }
    const identification = html.indexOf("Identification")
    const coordinates = html.indexOf("Coordonnées")
    const complement = html.indexOf("Complément")
    assert.ok(identification < html.indexOf('id="autre-role"') && html.indexOf('id="autre-role"') < coordinates)
    assert.ok(complement < html.indexOf('id="autre-observations"') && html.indexOf('id="autre-observations"') < html.indexOf('id="autre-entite"'))
    assert.ok(html.includes(`value="${acteur ? "27/09/1990" : ""}"`))
  }
})
