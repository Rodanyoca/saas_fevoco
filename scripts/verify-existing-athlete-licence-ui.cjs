/* eslint-disable @typescript-eslint/no-require-imports -- Browser fixture without production access. */
/* global require, __dirname, console, process, document, URL */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack"), { chromium } = require("@playwright/test")
const { harness } = require("../tests/helpers/sports-harness.cjs")
async function main() {
  const root = path.resolve(__dirname, ".."), out = path.join(root, ".next/cache/existing-athlete-licence-ui"), evidence = path.join(root, "docs/verification/existing-athlete-licence")
  await fs.mkdir(out, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  await fs.writeFile(path.join(out, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out, "navigation.ts"), "export const useRouter=()=>({refresh(){}});")
  await fs.writeFile(path.join(out, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{AthletesClient}from'@/components/athletes/athletes-client';import{AthleteLicencesClient}from'@/components/licences/athlete-licences-client';const person={id:'ATH00001',idAthlete:'ATH00001',nomComplet:'Historique navigateur',genre:'Masculin',sexe:'Masculin',dateNaissance:'',dateDeNaissance:'',statut:'Actif',clubNom:'',clubId:'',idNational:'',idFivb:'',nationalite:'',telephone:'',email:'',adresse:'',lieuNaissance:'',observations:'',avatarDriveId:'',avatarDriveUrl:''};const creation={clubs:[{id:'0101001',label:'Club Alpha'},{id:'0101002',label:'Club Beta'}],seasons:[{id:'SAI006',label:'2026'}],statuses:[{id:'STL001',label:'ACTIVE'}],candidates:[],sportsWritesEnabled:true};createRoot(document.getElementById('root')).render(location.search.includes('profile')?<AthletesClient athletes={[person]} licences={[]} sexes={[]} />:<AthleteLicencesClient rows={[]} error="" creation={creation} canWrite/>);`)
  await new Promise((resolve, reject) => { const compiler = webpack({ mode: "development", devtool: false, entry: path.join(out, "entry.jsx"), output: { path: out, filename: "bundle.js" }, resolve: { alias: { "next/navigation": path.join(out, "navigation.ts"), "@": root }, extensions: [".tsx", ".ts", ".js"] }, module: { rules: [{ test: /\.tsx?$|entry\.jsx$/, use: path.join(out, "loader.cjs") }] } }); compiler.run((error, stats) => compiler.close(() => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve())) })
  const cssDir = path.join(root, ".next/static/chunks"), css = (await Promise.all((await fs.readdir(cssDir)).filter(name => name.endsWith(".css")).map(name => fs.readFile(path.join(cssDir, name), "utf8")))).join("\n")
  const server = http.createServer(async (req, res) => {
    if (req.url === "/bundle.js") { res.setHeader("Content-Type", "text/javascript"); return res.end(await fs.readFile(path.join(out, "bundle.js"))) }
    if (req.url === "/style.css") { res.setHeader("Content-Type", "text/css"); return res.end(css) }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end('<html lang="fr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><main class="p-4"><div id="root"></div></main><script>window.process={env:{NODE_ENV:"development"},browser:true}</script><script src="/bundle.js"></script></body></html>')
  })
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  let browser
  const results = [], errors = []
  try {
    browser = await chromium.launch({ headless: true })
    for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) for (const entry of ["profile", "licences"]) {
      const h = harness({ onboarding: true, management: true }), service = h.loadModule("lib/existing-athlete-licence.ts"), posts = []
      h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length = 1
      const identity = JSON.stringify(h.books.ACT), page = await browser.newPage({ viewport })
      let failLicence = true, loseResponse = true
      page.setDefaultTimeout(25000); page.on("pageerror", error => { errors.push(error.message); console.error(error.stack) })
      await page.clock.install({ time: new Date("2026-05-01T12:00:00Z") })
      await page.route("**/api/**", async route => {
        const req = route.request(), url = new URL(req.url())
        if (!url.pathname.endsWith("/licences/athletes/existing")) {
          await route.fulfill({ json: { affiliations: h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.slice(1).map(row => ({ id: row[0], actorId: row[1], clubId: row[2], structure: "Club Alpha", dateDebut: row[3], dateFin: "", statusId: "SAF001", statut: "Actif", transferTypeId: "TRF001", transferType: "Première affiliation", temporalState: "Actuel" })), references: { clubs: [], statuses: [], transferTypes: [], sportsWritesEnabled: true } } }); return
        }
        try {
          if (req.method() === "GET") {
            const options = await service.existingAthleteLicenceOptions(h.createStore(), { actorId: url.searchParams.get("actor"), clubId: url.searchParams.get("club"), seasonId: url.searchParams.get("season") }, "2026-05-01")
            await route.fulfill({ json: options }); return
          }
          posts.push(req.postDataJSON()); h.state.rejectBook = failLicence ? "LIC" : ""
          const result = await service.runExistingAthleteLicence(h.createStore(), "U1", posts.at(-1), "2026-05-01")
          if (loseResponse) { loseResponse = false; await route.abort("failed"); return }
          await route.fulfill({ status: 201, json: result })
        } catch (error) { await route.fulfill({ status: error.status || 503, json: { state: error.state, code: error.code, uncertain: error.uncertain, message: error.message } }) }
      })
      await page.goto(`http://127.0.0.1:${server.address().port}/?${entry}`)
      if (entry === "profile") {
        await page.getByRole("button", { name: /Voir|Consulter/ }).first().click()
        await page.getByRole("heading", { name: /Historique des licences/ }).waitFor()
        assert.equal(await page.getByRole("button", { name: "Ajouter une licence", exact: true }).count(), 0)
        results.push({ viewport: name, entry, athleteDetailHasNoAddLicence: true })
        await page.close()
        continue
      }
      await page.getByRole("button", { name: "Ajouter une licence", exact: true }).click()
      const dialog = page.getByRole("dialog"), save = dialog.getByRole("button", { name: "Enregistrer", exact: true })
      await page.waitForFunction(() => !document.getElementById("existing-club").disabled)
      await dialog.getByRole("combobox").first().click()
      await page.getByRole("option", { name: "SAI006", exact: true }).click()
      await dialog.getByRole("textbox", { name: "Club *", exact: true }).fill("Club Alpha")
      await page.getByRole("button", { name: /^Club Alpha/ }).click()
      await dialog.getByRole("checkbox", { name: "Rechercher un athlète existant à rattacher à ce club", exact: true }).check()
      await dialog.getByRole("textbox", { name: "Athlète existant *", exact: true }).fill("Existing 0")
      await dialog.getByRole("button", { name: /^Existing 0/ }).click()
      await dialog.getByRole("heading", { name: "Première affiliation à créer", exact: true }).waitFor()
      assert.equal(await dialog.getByLabel("Date réelle de première affiliation", { exact: false }).inputValue(), "")
      assert.equal(await save.isDisabled(), true)
      await dialog.getByLabel("Date réelle de première affiliation", { exact: false }).fill("31022026")
      await dialog.getByRole("checkbox", { name: /^Je confirme/ }).check()
      assert.equal(await save.isEnabled(), true)
      await save.click()
      await dialog.getByRole("alert").getByText(/date de première affiliation n'est pas une date civile valide/i).waitFor()
      assert.equal(posts.length, 0)
      await dialog.getByLabel("Date réelle de première affiliation", { exact: false }).fill("01/01/2026")
      assert.equal(await dialog.getByLabel("Date réelle de première affiliation", { exact: false }).inputValue(), "01/01/2026")
      assert.equal(await dialog.getByRole("checkbox", { name: /^Je confirme/ }).isChecked(), true)
      assert.equal(await save.isEnabled(), true)
      await page.screenshot({ path: path.join(evidence, `${name}-${entry}-affiliation.png`), fullPage: false })
      await save.evaluate(button => { button.click(); button.click() })
      const retry = dialog.getByRole("button", { name: "Reprendre l’enregistrement", exact: true })
      await retry.waitFor(); assert.equal(posts.length, 1); assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 2)
      failLicence = false
      await retry.click(); await dialog.getByRole("alert").getByText(/Résultat non confirmé/).waitFor()
      await retry.click(); await dialog.waitFor({ state: "hidden" })
      assert.equal(posts.length, 3); assert.deepEqual(posts[0], posts[1]); assert.deepEqual(posts[1], posts[2])
      assert.equal(JSON.stringify(h.books.ACT), identity); assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
      await page.screenshot({ path: path.join(evidence, `${name}-${entry}-succes.png`), fullPage: false })
      results.push({ viewport: name, entry, noIdentityWrite: true, dateRequired: true, invalidDateRejected: true, oneAffiliation: true, oneLicence: true, partialRecovery: true, lostResponse: true, doubleClick: true, dedicatedLicenceInterface: true })
      await page.close()
    }
    assert.deepEqual(errors, []); await fs.writeFile(path.join(evidence, "results.json"), JSON.stringify(results, null, 2)); console.log(JSON.stringify(results))
  } catch (error) {
    const page = browser?.contexts().flatMap(context => context.pages()).at(-1)
    if (page) await page.screenshot({ path: path.join(evidence, "failure.png"), fullPage: false })
    throw error
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
