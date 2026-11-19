/* eslint-disable @typescript-eslint/no-require-imports -- Browser fixture without production access. */
/* global require, __dirname, console, process */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack"), { chromium } = require("@playwright/test")
const { harness } = require("../tests/helpers/sports-harness.cjs")
async function main() {
  const root = path.resolve(__dirname, ".."), out = path.join(root, ".next/cache/record-management-ui"), evidence = path.join(root, "docs/verification/record-management")
  await fs.mkdir(out, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  await fs.writeFile(path.join(out, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out, "navigation.ts"), "export const useRouter=()=>({refresh(){}});")
  await fs.writeFile(path.join(out, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{DeleteRecordButton}from'@/components/actors/record-management';function App(){const[visible,setVisible]=React.useState(true);return visible?<DeleteRecordButton entity="actor" family="athlete" id="TEST-UI" label="Athlète de test" onDeleted={()=>setVisible(false)}/>:<p role="status">Dossier retiré</p>}createRoot(document.getElementById('root')).render(<App/>);`)
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
    for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      const h = harness({ onboarding: true, management: true }), api = h.loadModule("lib/record-management-api.ts"), sheet = h.books.ACT.sheets.ATHLETES
      sheet.values.push(sheet.values[0].map(key => key === "id_athlete" ? "TEST-UI" : key === "nom_complet" ? "Athlète de test" : ""))
      const page = await browser.newPage({ viewport }), posted = []
      let blocked = true, loseResponse = true
      page.on("pageerror", error => errors.push(error.message))
      await page.route("**/api/actors/records**", async route => {
        const req = route.request(), request = new Request(req.url(), { method: req.method(), headers: { origin: new URL(req.url()).origin, "Content-Type": "application/json" }, ...(req.method() === "DELETE" ? { body: req.postData() } : {}) })
        const response = await api[req.method() === "GET" ? "recordGET" : "recordDELETE"](request), body = await response.json()
        if (req.method() === "GET" && blocked) { body.blocked = true; body.dependencies = [{ book: "licences", table: "ATHLETE_LICENCES", count: 1, href: "/licences" }] }
        if (req.method() === "DELETE") { posted.push(req.postDataJSON()); if (loseResponse) { loseResponse = false; return route.abort("failed") } }
        await route.fulfill({ status: response.status, json: body })
      })
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      await page.getByRole("button", { name: "Supprimer Athlète de test" }).focus(); await page.keyboard.press("Enter")
      const dialog = page.getByRole("alertdialog"), confirm = dialog.getByRole("button", { name: "Supprimer définitivement", exact: true })
      await dialog.getByText("Suppression bloquée par :").waitFor(); assert.equal(await confirm.isDisabled(), true)
      await page.screenshot({ path: path.join(evidence, `${name}-dependances.png`), fullPage: true })
      await dialog.getByRole("button", { name: "Annuler", exact: true }).click(); blocked = false
      await page.getByRole("button", { name: "Supprimer Athlète de test" }).click()
      await confirm.waitFor(); await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'Supprimer définitivement' && !button.disabled))
      await confirm.evaluate(button => { button.click(); button.click() })
      const retry = dialog.getByRole("button", { name: "Vérifier cette suppression", exact: true }); await retry.waitFor()
      assert.equal(posted.length, 1); assert.equal(await dialog.getByRole("button", { name: "Annuler", exact: true }).isDisabled(), true)
      await page.screenshot({ path: path.join(evidence, `${name}-verification.png`), fullPage: true })
      await retry.click(); await page.getByText("Dossier retiré", { exact: true }).waitFor()
      assert.equal(posted.length, 2); assert.deepEqual(posted[0], posted[1])
      assert.equal(h.books.ACT.sheets.ATHLETES.values.some(row => row.includes("TEST-UI")), false)
      results.push({ viewport: name, blocked: true, keyboard: true, doubleClick: true, lostResponse: true, sameOperation: true, confirmedRemoval: true })
      await page.close()
    }
    assert.deepEqual(errors, []); await fs.writeFile(path.join(evidence, "results.json"), JSON.stringify(results, null, 2)); console.log(JSON.stringify(results))
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
