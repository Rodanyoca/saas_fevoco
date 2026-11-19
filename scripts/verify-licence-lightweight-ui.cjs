/* eslint-disable @typescript-eslint/no-require-imports -- Browser fixture without production access. */
/* global require, __dirname, console, process, document, setTimeout */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack"), { chromium } = require("@playwright/test")
const { harness } = require("../tests/helpers/sports-harness.cjs")
async function main() {
  const root = path.resolve(__dirname, ".."), out = path.join(root, ".next/cache/licence-lightweight-ui"), evidence = path.join(root, "docs/verification/licence-lightweight")
  await fs.mkdir(out, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  await fs.writeFile(path.join(out, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out, "navigation.ts"), "export const useRouter=()=>({refresh(){}});")
  await fs.writeFile(path.join(out, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{ExistingAthleteLicenceDialog}from'@/components/licences/existing-athlete-licence-dialog';createRoot(document.getElementById('root')).render(<ExistingAthleteLicenceDialog/>);`)
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
    for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) for (const scenario of ["normal", "orphan"]) {
      const h = harness({ onboarding: true, management: true }), service = h.loadModule("lib/existing-athlete-licence.ts"), posts = []
      h.books.REF.sheets.SAISON.values.push(["SAI007", "2027-01-01", "2027-12-31", "STS005"])
      h.books.REF.sheets.SAISON.values[1][3] = "STS005"
      if (scenario === "orphan") { await h.run(); h.books.LIC.sheets.ATHLETE_LICENCES.values.length = 1 }
      let reads = 0, loseResponse = true
      const page = await browser.newPage({ viewport }); page.setDefaultTimeout(20000)
      page.on("pageerror", error => errors.push(error.message))
      await page.route("**/api/licences/athletes/existing**", async route => {
        const req = route.request()
        try {
          if (req.method() === "GET") { reads++; await route.fulfill({ json: await service.existingAthleteLicenceOptions(h.createStore(), {}, "2026-05-01") }); return }
          posts.push(req.postDataJSON())
          const result = await service.runExistingAthleteLicence(h.createStore(), "U1", posts.at(-1), "2026-05-01")
          if (loseResponse) { loseResponse = false; await route.abort("failed"); return }
          await route.fulfill({ status: 201, json: result })
        } catch (error) { await route.fulfill({ status: error.status || 503, json: { state: error.state, uncertain: error.uncertain, message: error.message, code: error.code } }) }
      })
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      await page.getByRole("button", { name: "Ajouter une licence", exact: true }).click()
      const dialog = page.getByRole("dialog")
      await page.waitForFunction(() => !document.getElementById("existing-club").disabled)
      const initialSearch = dialog.getByRole("textbox", { name: "Athlète existant *", exact: true })
      await initialSearch.fill("Existing 0"); await dialog.getByRole("button", { name: /^Existing 0/ }).click()
      assert.equal(await dialog.getByRole("textbox", { name: "Club *", exact: true }).inputValue(), "Club Alpha")
      await dialog.getByLabel("Saison", { exact: false }).click(); await page.getByRole("option", { name: "SAI007", exact: true }).click()
      await dialog.getByLabel("Saison", { exact: false }).click(); await page.getByRole("option", { name: "SAI006", exact: true }).click()
      const search = dialog.getByRole("textbox", { name: "Athlète existant *", exact: true })
      await search.fill("Existing"); await search.fill("Existing 0")
      await dialog.getByRole("button", { name: /^Existing 0/ }).click()
      assert.equal(reads, 1, "club, season and search must not fetch again")
      assert.equal(await dialog.getByRole("heading", { name: "Première affiliation à créer", exact: true }).count(), 0)
      await page.screenshot({ path: path.join(evidence, `${name}-${scenario}-affiliation-active.png`), fullPage: false })
      await dialog.getByRole("button", { name: "Enregistrer", exact: true }).evaluate(button => { button.click(); button.click() })
      const retry = dialog.getByRole("button", { name: "Reprendre l’enregistrement", exact: true }); await retry.waitFor()
      assert.equal(posts.length, 1); await retry.click(); await dialog.waitFor({ state: "hidden" })
      assert.deepEqual(posts[0], posts[1]); assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
      assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 3)
      results.push({ viewport: name, scenario, optionsRequests: reads, automaticNumber: scenario === "orphan" ? "0101001002" : "0101001001", noSeasonOpeningGate: true, noFetchOnClubSeasonSearch: true, noExtraAffiliation: true, repeatedRequest: true })
      await page.close()
    }
    assert.deepEqual(errors, []); await fs.writeFile(path.join(evidence, "results.json"), JSON.stringify(results, null, 2)); console.log(JSON.stringify(results))
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
