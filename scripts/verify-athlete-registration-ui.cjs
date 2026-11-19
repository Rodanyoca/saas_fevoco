/* eslint-disable @typescript-eslint/no-require-imports -- Isolated browser fixture; no production server or Google writes. */
/* global require, __dirname, console, process, document, innerWidth */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack"), { chromium } = require("@playwright/test")
const { harness } = require("../tests/helpers/sports-harness.cjs")
async function main() {
  const root = path.resolve(__dirname, ".."), out = path.join(root, ".next/cache/athlete-registration-ui"), evidence = path.join(root, "docs/verification/athlete-registration")
  await fs.mkdir(out, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  await fs.writeFile(path.join(out, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out, "navigation.ts"), "export const useRouter=()=>({refresh(){}});export const usePathname=()=>'/athletes';")
  await fs.writeFile(path.join(out, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{AthletesClient}from'@/components/athletes/athletes-client';createRoot(document.getElementById('root')).render(<AthletesClient athletes={[]} licences={[]} sexes={[{id:'SEX001',nom:'MASCULIN'}]}/>);`)
  await new Promise((resolve, reject) => { const compiler = webpack({ mode: "development", devtool: false, entry: path.join(out, "entry.jsx"), output: { path: out, filename: "bundle.js" }, resolve: { alias: { "next/navigation": path.join(out, "navigation.ts"), "@": root }, extensions: [".tsx", ".ts", ".js"] }, module: { rules: [{ test: /\.tsx?$|entry\.jsx$/, use: path.join(out, "loader.cjs") }] } }); compiler.run((error, stats) => compiler.close(() => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve())) })
  const cssDir = path.join(root, ".next/static/chunks"), css = (await Promise.all((await fs.readdir(cssDir)).filter(name => name.endsWith(".css")).map(name => fs.readFile(path.join(cssDir, name), "utf8")))).join("\n")
  const server = http.createServer(async (req, res) => {
    if (req.url === "/bundle.js") { res.setHeader("Content-Type", "text/javascript"); res.end(await fs.readFile(path.join(out, "bundle.js"))); return }
    if (req.url === "/style.css") { res.setHeader("Content-Type", "text/css"); res.end(css); return }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end('<html lang="fr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><main class="p-4"><div id="root"></div></main><script>window.process={env:{NODE_ENV:"development"},browser:true}</script><script src="/bundle.js"></script></body></html>')
  })
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  let browser
  const results = [], errors = []
  try {
    browser = await chromium.launch({ headless: true })
    for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      const h = harness({ onboarding: true }), domain = h.loadModule("lib/athlete-registration.ts"), posted = [], patches = []
      let saved, optionsReads = 0
      const page = await browser.newPage({ viewport })
      await page.clock.install({ time: new Date("2026-11-18T12:00:00Z") })
      page.setDefaultTimeout(20000); page.on("pageerror", error => errors.push(error.message))
      await page.route("**/api/**", async route => {
        const req = route.request()
        if (req.url().endsWith("/registration")) { optionsReads++; await route.fulfill({ json: domain.registrationOptions(await h.createStore().load(true), "2026-11-18") }); return }
        if (req.url().includes("/api/actors/records")) { await route.fulfill({ json: { version: "fixture-version" } }); return }
        if (req.method() === "PATCH") { patches.push(req.postDataJSON()); await route.fulfill({ json: { athlete: { ...saved.athlete, telephone: patches.at(-1).telephone }, message: "Identité modifiée." } }); return }
        if (req.method() === "GET") { await route.fulfill({ json: { affiliations: saved ? [{ id: saved.affiliation.id, actorId: saved.athlete.idAthlete, clubId: saved.affiliation.clubId, structure: "Club Alpha", dateDebut: "2026-01-01", dateFin: "", statusId: "SAF001", statut: "Actif", observations: "", transferTypeId: "TRF001", transferType: "Première affiliation", previousAffiliationId: "", transferRole: "TRF001", temporalState: "Actuel" }] : [], references: { clubs: [], statuses: [], transferTypes: [], sportsWritesEnabled: true } } }); return }
        posted.push(req.postDataJSON()); h.state.failBook = posted.length === 1 ? "LIC" : ""
        try { saved = await domain.runAthleteRegistration(h.createStore(), "U1", posted.at(-1), "2026-11-18"); await route.fulfill({ status: 201, json: { ...saved, message: `Athlète et licence ${saved.numeroLicence} enregistrés.` } }) }
        catch (error) { await route.fulfill({ status: error.status || 503, json: { state: error.state, code: error.code, message: error.message, existingAthleteId: error.existingAthleteId } }) }
      })
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      await page.getByRole("button", { name: "Créer un athlète", exact: true }).click()
      const dialog = page.getByRole("dialog")
      await dialog.getByLabel("Nom complet", { exact: false }).fill("Athlete navigateur")
      await page.waitForFunction(() => !document.getElementById("registration-club").disabled)
      await dialog.getByLabel("Sexe", { exact: false }).focus(); await page.keyboard.press("Space"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter")
      await dialog.getByLabel("Club", { exact: false }).fill("Club Alpha")
      await dialog.getByRole("button", { name: /Club Alpha/ }).click()
      await dialog.getByLabel("Date de première affiliation", { exact: false }).fill("01012026")
      await dialog.getByLabel("Date de naissance", { exact: true }).fill("31022000")
      await dialog.getByRole("button", { name: "Enregistrer", exact: true }).click()
      await dialog.getByRole("alert").waitFor(); assert.equal(posted.length, 0)
      await dialog.getByLabel("Date de naissance", { exact: true }).fill("02022000")
      assert.equal(await dialog.getByLabel("Date de première affiliation", { exact: false }).inputValue(), "01/01/2026")
      await dialog.getByRole("button", { name: "Enregistrer", exact: true }).evaluate(button => { button.click(); button.click() })
      await dialog.getByRole("button", { name: "Reprendre l’enregistrement", exact: true }).waitFor()
      assert.equal(posted.length, 1)
      assert.equal(await dialog.getByLabel("Nom complet", { exact: false }).inputValue(), "Athlete navigateur")
      assert.equal(await dialog.getByLabel("Nom complet", { exact: false }).isDisabled(), true)
      await dialog.evaluate(element => { element.scrollTop = 0 })
      await page.screenshot({ path: path.join(evidence, `${name}-identite.png`), fullPage: true })
      await dialog.getByRole("button", { name: "Reprendre l’enregistrement", exact: true }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(evidence, `${name}-reprise.png`), fullPage: true })
      await dialog.getByRole("button", { name: "Reprendre l’enregistrement", exact: true }).click()
      await dialog.waitFor({ state: "hidden" })
      assert.deepEqual(posted[0], posted[1]); assert.equal(optionsReads, 1)
      if (name === "desktop") await page.getByRole("cell", { name: saved.numeroLicence, exact: true }).waitFor()
      else { const cardLicence = page.getByText("Licence :", { exact: true }).locator(".."); await cardLicence.waitFor(); assert.ok((await cardLicence.textContent()).includes(saved.numeroLicence)) }
      assert.equal(count(h, "ACT", "ATHLETES"), 3); assert.equal(count(h, "LIC", "ATHLETE_LICENCES"), 1)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.screenshot({ path: path.join(evidence, `${name}-liste.png`), fullPage: true })
      await page.getByRole("button", { name: /Voir|Consulter/ }).first().click()
      await page.getByText(saved.numeroLicence, { exact: true }).first().waitFor()
      await page.getByRole("heading", { name: /Historique des transferts/, exact: false }).waitFor()
      await page.getByText("Club Alpha", { exact: true }).filter({ visible: true }).first().waitFor()
      const athleteSummary = page.getByTestId("athlete-summary")
      await athleteSummary.getByText("Club Alpha", { exact: true }).waitFor()
      await athleteSummary.getByText("01/01/2026", { exact: true }).waitFor()
      await athleteSummary.getByText(saved.numeroLicence, { exact: true }).waitFor()
      assert.equal(await athleteSummary.getByText("Saison de licence", { exact: true }).count(), 0)
      assert.equal(await athleteSummary.getByText(saved.athlete.statut, { exact: true }).count(), 1)
      assert.equal(await athleteSummary.getByText("Statut d’affiliation", { exact: true }).count(), 0)
      const deleteAffiliation = page.getByRole("button", { name: "Supprimer Club Alpha" }).first()
      assert.equal(await deleteAffiliation.locator("svg").count(), 1)
      assert.equal(await deleteAffiliation.locator("span.sr-only").count(), 1)
      await page.getByRole("button", { name: "Modifier l’athlète", exact: true }).click()
      await dialog.getByLabel("Téléphone", { exact: true }).fill("012345")
      assert.equal(await dialog.getByLabel("Club", { exact: false }).count(), 0)
      await dialog.getByRole("button", { name: "Enregistrer", exact: true }).click(); await dialog.waitFor({ state: "hidden" })
      assert.equal(patches.length, 1); assert.equal(patches[0].clubId, undefined); assert.equal(posted.length, 2)
      await page.getByRole("button", { name: "Retour à la liste", exact: true }).click()
      await page.getByRole("button", { name: "Créer un athlète", exact: true }).click()
      await dialog.getByLabel("Nom complet", { exact: false }).fill("Athlete navigateur")
      await page.waitForFunction(() => !document.getElementById("registration-club").disabled)
      await dialog.getByLabel("Sexe", { exact: false }).focus(); await page.keyboard.press("Space"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter")
      await dialog.getByLabel("Club", { exact: false }).fill("Club Alpha")
      await dialog.getByRole("button", { name: /Club Alpha/ }).click()
      await dialog.getByLabel("Date de première affiliation", { exact: false }).fill("01012026")
      await dialog.getByLabel("Date de naissance", { exact: true }).fill("02022000")
      await dialog.getByRole("button", { name: "Enregistrer", exact: true }).click()
      await dialog.getByRole("button", { name: "Consulter la fiche existante", exact: true }).click()
      await dialog.waitFor({ state: "hidden" })
      assert.notEqual(posted[2].idempotencyKey, posted[0].idempotencyKey)
      assert.equal(count(h, "ACT", "ATHLETES"), 3); assert.equal(count(h, "LIC", "ATHLETE_LICENCES"), 1)
      results.push({ name, optionsReads, attempts: posted.length, identityCount: 1, licenceCount: 1, editOnlyIdentity: true, historyVisible: true, duplicateConsultation: true, errors: 0 })
      await page.close()
    }
    assert.deepEqual(errors, [])
    await fs.writeFile(path.join(evidence, "results.json"), JSON.stringify(results, null, 2))
    console.log(JSON.stringify(results))
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)) }
}
function count(h, book, table) { return h.books[book].sheets[table].values.length - 1 }
main().catch(error => { console.error(error); process.exitCode = 1 })
