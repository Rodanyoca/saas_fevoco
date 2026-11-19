/* eslint-disable @typescript-eslint/no-require-imports -- Browser fixture without production access. */
/* global require, __dirname, console, process, document, setTimeout */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack"), { chromium } = require("@playwright/test")
const { harness } = require("../tests/helpers/sports-harness.cjs")
async function main() {
  const root = path.resolve(__dirname, ".."), out = path.join(root, ".next/cache/licence-eligibility-ui"), evidence = path.join(root, "docs/verification/licence-eligibility")
  await fs.mkdir(out, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  await fs.writeFile(path.join(out, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out, "navigation.ts"), "export const useRouter=()=>({refresh(){}});")
  await fs.writeFile(path.join(out, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{AthleteLicenceEditor}from'@/components/licences/athlete-licence-editor';const refs={sportsWritesEnabled:true,clubs:[{id:'0101001',label:'Club Alpha'},{id:'0101002',label:'Club Beta'}],seasons:[{id:'SAI006',label:'2026'},{id:'SAI007',label:'2027'}],statuses:[{id:'STL001',label:'ACTIVE'}],candidates:[]};function App(){const[open,setOpen]=React.useState(true);const[saved,setSaved]=React.useState(false);return <><AthleteLicenceEditor open={open} onOpenChange={setOpen} references={refs} rows={[]} editing={null} readOnly={false} mode="ATHLETE" initialSeason="SAI006" onSaved={()=>setSaved(true)}/>{saved&&<p role="status">Enregistrement confirmé</p>}</>}createRoot(document.getElementById('root')).render(<App/>);`)
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
  function fixture() {
    const h = harness({ onboarding: true, management: true })
    h.books.REF.sheets.SAISON.values.push(["SAI007", "2027-01-01", "2027-12-31", "STS002"])
    return h
  }
  try {
    browser = await chromium.launch({ headless: true })
    for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      let h = fixture(), loseResponse = false, getCount = 0
      await h.run()
      const page = await browser.newPage({ viewport }), posts = []
      page.setDefaultTimeout(20000)
      await page.clock.install({ time: new Date("2026-05-01T12:00:00Z") })
      page.on("pageerror", error => errors.push(error.message))
      await page.route("**/api/licences/athletes**", async route => {
        const request = route.request(), query = new URL(request.url()).searchParams
        try {
          if (request.method() === "GET") {
            getCount++
            const result = await h.loadModule("lib/athlete-licence-creation.ts").athleteLicenceCandidates({ clubId: query.get("club"), seasonId: query.get("season"), date: query.get("date") })
            if (query.get("club") === "0101002") await new Promise(resolve => setTimeout(resolve, 300))
            await route.fulfill({ json: result }); return
          }
          const input = request.postDataJSON(); posts.push(input)
          const licence = (await h.mutateSeasonalLicence(input))[0]
          if (loseResponse) { loseResponse = false; await route.abort("failed"); return }
          await route.fulfill({ status: 201, json: { licence } })
        } catch (error) { await route.fulfill({ status: error.status || 503, json: { code: error.code, uncertain: error.uncertain, message: error.message } }).catch(() => {}) }
      })
      const chooseClub = async label => { await page.getByLabel("Club", { exact: false }).fill(label); await page.getByRole("button", { name: new RegExp("^" + label) }).click() }
      const season = async label => { await page.getByLabel("Saison", { exact: false }).click(); await page.getByRole("option", { name: new RegExp("^" + label) }).click() }
      const athlete = () => page.getByLabel("Athlète", { exact: false })
      const save = () => page.getByRole("button", { name: "Enregistrer la licence", exact: true })
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      await chooseClub("Club Alpha")
      await page.waitForFunction(() => !document.getElementById("lic-athlete").disabled)
      await athlete().fill("Existing")
      await page.getByRole("button", { name: /^Existing 1/ }).waitFor()
      assert.equal(await page.getByRole("button", { name: /^Existing 0/ }).count(), 0)
      const reads = getCount; await athlete().fill("Existing 1"); assert.equal(getCount, reads)
      await page.screenshot({ path: path.join(evidence, `${name}-candidats.png`), fullPage: true })
      await chooseClub("Club Beta"); await chooseClub("Club Alpha")
      await page.waitForFunction(() => !document.getElementById("lic-athlete").disabled)
      await athlete().fill("Existing"); await page.getByRole("button", { name: /^Existing 1/ }).click()
      await season("2027")
      await page.getByRole("alert").waitFor(); assert.equal(await athlete().isDisabled(), true)
      await page.getByLabel("Date de délivrance", { exact: false }).fill("01052027")
      await page.waitForFunction(() => !document.getElementById("lic-athlete").disabled)
      await athlete().fill("Existing"); await page.getByRole("button", { name: /^Existing 0/ }).waitFor()
      h.state.failReadBook = "LIC"; await chooseClub("Club Beta")
      await page.getByRole("alert").waitFor(); assert.equal(await save().isDisabled(), true)
      h.state.failReadBook = ""; await page.getByRole("button", { name: "Réessayer", exact: true }).click()
      await page.getByText("Aucun athlète éligible pour ce club et cette saison.", { exact: true }).waitFor()
      await chooseClub("Club Alpha"); await season("2026"); await page.getByLabel("Date de délivrance", { exact: false }).fill("01052026")
      await page.waitForFunction(() => !document.getElementById("lic-athlete").disabled)
      await athlete().fill("Existing"); await page.getByRole("button", { name: /^Existing 1/ }).click()
      await h.run("ATH00002", "99999999-1111-4111-8111-111111111111")
      await save().click(); await page.getByText("Aucun athlète éligible pour ce club et cette saison.", { exact: true }).waitFor()
      assert.equal(await page.getByLabel("Club", { exact: false }).inputValue(), "Club Alpha")
      assert.ok((await page.getByLabel("Saison", { exact: false }).textContent()).includes("2026"))
      assert.equal(await save().isDisabled(), true)
      await page.screenshot({ path: path.join(evidence, `${name}-concurrence.png`), fullPage: true })
      h = fixture(); await h.run(); posts.length = 0; loseResponse = true
      await page.reload(); await chooseClub("Club Alpha")
      await page.waitForFunction(() => !document.getElementById("lic-athlete").disabled)
      await athlete().fill("Existing"); await page.getByRole("button", { name: /^Existing 1/ }).click()
      await save().evaluate(button => { button.click(); button.click() })
      const retry = page.getByRole("button", { name: "Vérifier cette tentative", exact: true }); await retry.waitFor()
      assert.equal(posts.length, 1)
      await retry.click(); await page.getByText("Enregistrement confirmé", { exact: true }).waitFor()
      assert.deepEqual(posts[0], posts[1]); assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 3)
      results.push({ viewport: name, excludedExisting: true, seasonReset: true, staleResponse: true, noReadsPerKeystroke: true, readFailure: true, concurrentDelivery: true, doubleSubmission: true, lostResponseRetry: true })
      await page.close()
    }
    assert.deepEqual(errors, []); await fs.writeFile(path.join(evidence, "results.json"), JSON.stringify(results, null, 2)); console.log(JSON.stringify(results))
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
