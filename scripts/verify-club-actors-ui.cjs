/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification of real components. */
/* global require, __dirname, console, process, document, window, innerWidth */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack")
const { chromium } = require("@playwright/test")

async function main() {
  const root = path.resolve(__dirname, "..")
  const output = path.join(root, ".next/cache/club-actors-ui-20261105")
  const evidence = path.join(root, "docs/performance/club-actors-ui-2026-11-05")
  await fs.mkdir(output, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  console.log("Banc UI : préparation des composants réels…")
  await fs.writeFile(path.join(output, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(source){return ts.transpileModule(source,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(output, "navigation.ts"), "export const useRouter=()=>({refresh(){},push(){}});export const usePathname=()=>'/clubs';export const useSearchParams=()=>new URLSearchParams();")
  await fs.writeFile(path.join(output, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{ClubsClient}from'@/components/clubs/clubs-client';import{DashboardLayout}from'@/components/dashboard/dashboard-layout';const club=(id,nom)=>({id,idClub:id,codeClub:id,nomClub:nom,categorie:'Senior',idCategorieClub:'CAT',version:'Mixte',idSexe:'S1',nomLigue:'Ligue test',pseudoEntente:'Entente test',statut:'ACTIF',dateCreation:'',dateAffiliationClub:'',observations:'',logoDriveUrl:'',idEntente:'EN1'});function App(){const[clubs,setClubs]=React.useState([club('C1','Club Alpha'),club('C2','Club Beta')]);window.refreshClubs=()=>setClubs(previous=>previous.map(item=>({...item})));return <DashboardLayout><ClubsClient clubs={clubs} ententes={[]} categories={[]} sexes={[]}/></DashboardLayout>}createRoot(document.getElementById('root')).render(<App/>);`)
  if (!process.argv.includes("--reuse-bundle")) await new Promise((resolve, reject) => {
    const compiler = webpack({ mode: "development", devtool: false, entry: path.join(output, "entry.jsx"), output: { path: output, filename: "bundle.js" }, resolve: { alias: { "next/navigation": path.join(output, "navigation.ts"), "@": root }, extensions: [".tsx", ".ts", ".js"] }, module: { rules: [{ test: /\.tsx?$|entry\.jsx$/, use: path.join(output, "loader.cjs") }] } })
    compiler.run((error, stats) => compiler.close(() => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve()))
  })
  const cssDir = path.join(root, ".next/static/chunks")
  console.log("Banc UI : bundle prêt, lancement du navigateur…")
  const css = (await Promise.all((await fs.readdir(cssDir)).filter(name => name.endsWith(".css")).map(name => fs.readFile(path.join(cssDir, name), "utf8")))).join("\n")
  const server = http.createServer(async (request, response) => {
    if (request.url === "/bundle.js") { response.setHeader("content-type", "text/javascript"); response.end(await fs.readFile(path.join(output, "bundle.js"))); return }
    if (request.url === "/style.css") { response.setHeader("content-type", "text/css"); response.end(css); return }
    if (request.url.startsWith("/api/")) { response.setHeader("content-type", "application/json"); response.end(JSON.stringify({ user: null })); return }
    response.setHeader("content-type", "text/html; charset=utf-8")
    response.end('<!doctype html><html lang="fr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"development"},browser:true}</script><script src="/bundle.js"></script></body></html>')
  })
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  let browser
  const counts = { desktop: 0, mobile: 0, error: 0, rapid: 0 }
  try {
    browser = await chromium.launch({ headless: true })
    const url = `http://127.0.0.1:${server.address().port}`
    const groups = (id = "A1", name = "Athlète test", number = "LIC-TEST") => ({ athletes: [{ id, nomComplet: name, sexe: "Masculin", telephone: "", email: "", statut: "ACTIF", fonction: "", numeroLicence: number }], coachs: [], medecins: [], officiels: [], autres: [] })
    const errors = []
    for (const [label, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
      console.log(`Banc UI : ${label}`)
      const page = await browser.newPage({ viewport }); page.setDefaultTimeout(60000); page.on("pageerror", error => errors.push(error.message))
      let release
      await page.route("**/api/clubs/*/actors", async route => { counts[label]++; await new Promise(resolve => { release = resolve }); await route.fulfill({ contentType: "application/json", body: JSON.stringify({ actors: groups(), ignoredRelations: 0 }) }) })
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.getByRole("heading", { name: "Clubs", exact: true }).waitFor()
      assert.equal(counts[label], 0, "La liste ne charge aucun effectif")
      await page.getByRole("button", { name: "Voir Club Alpha", exact: true }).filter({ visible: true }).first().click()
      await page.getByRole("status").filter({ hasText: "Chargement des effectifs" }).waitFor()
      assert.equal(await page.getByRole("region", { name: "Athlètes du club", exact: true }).count(), 0, "Pas de succès simultané au chargement")
      await page.waitForFunction(() => document.querySelector('h1')?.textContent.includes('Club Alpha'))
      assert.equal(counts[label], 1)
      release()
      const athletes = page.getByRole("region", { name: "Athlètes du club", exact: true })
      await athletes.getByRole("cell", { name: "LIC-TEST", exact: true }).waitFor()
      await athletes.getByPlaceholder("Rechercher un athlète...").fill("LIC-TEST")
      assert.equal(await athletes.getByRole("cell", { name: "Athlète test", exact: true }).count(), 1)
      await athletes.getByPlaceholder("Rechercher un athlète...").fill("inexistant")
      await athletes.getByText("Aucune donnée trouvée", { exact: true }).waitFor()
      await athletes.getByPlaceholder("Rechercher un athlète...").fill("")
      await page.evaluate(() => window.refreshClubs())
      await page.getByRole("status").filter({ hasText: "Chargement des effectifs" }).waitFor()
      assert.equal(await athletes.count(), 0, "Une actualisation ne conserve pas les anciens effectifs visibles")
      assert.equal(counts[label], 2, "Un seul appel supplémentaire après actualisation des props serveur")
      release()
      await athletes.getByRole("cell", { name: "LIC-TEST", exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: path.join(evidence, `${label}.png`), fullPage: true })
      await page.getByRole("button", { name: "Modifier", exact: true }).click(); await page.getByRole("dialog").waitFor()
      await page.getByRole("dialog").getByRole("button", { name: "Annuler", exact: true }).click()
      assert.equal(counts[label], 2, "Annuler une modification ne relit pas les effectifs")
      await page.close()
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); page.setDefaultTimeout(60000); page.on("pageerror", error => errors.push(error.message))
    await page.route("**/api/clubs/*/actors", async route => { counts.error++; await route.fulfill({ status: counts.error === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(counts.error === 1 ? { message: "Source indisponible" } : { actors: groups(), ignoredRelations: 0 }) }) })
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.getByRole("button", { name: "Voir Club Alpha", exact: true }).first().click()
    await page.getByRole("alert").filter({ hasText: "Lecture des effectifs impossible" }).waitFor()
    assert.equal(counts.error, 1)
    await page.getByRole("button", { name: "Réessayer", exact: true }).click()
    await page.getByRole("cell", { name: "LIC-TEST", exact: true }).waitFor(); assert.equal(counts.error, 2)
    await page.unroute("**/api/clubs/*/actors")
    const pending = []
    await page.route("**/api/clubs/*/actors", async route => { counts.rapid++; const id = route.request().url().includes("/C1/") ? "C1" : "C2"; await new Promise(resolve => pending.push({ id, resolve })); try { await route.fulfill({ contentType: "application/json", body: JSON.stringify({ actors: groups(id, id === "C1" ? "Réponse ancienne" : "Athlète Beta", id === "C1" ? "OLD" : "BETA-LIC"), ignoredRelations: 0 }) }) } catch { /* Aborted requests are expected. */ } })
    await page.getByRole("button", { name: "Retour à la liste", exact: true }).click()
    await page.getByRole("button", { name: "Voir Club Alpha", exact: true }).first().click()
    await page.getByRole("status").filter({ hasText: "Chargement des effectifs" }).waitFor()
    for (let attempts = 0; !pending.some(item => item.id === "C1"); attempts++) { assert.ok(attempts < 1000, "Requête C1 attendue"); await page.waitForTimeout(10) }
    await page.getByRole("button", { name: "Retour à la liste", exact: true }).click()
    await page.getByRole("button", { name: "Voir Club Beta", exact: true }).first().click()
    for (let attempts = 0; !pending.some(item => item.id === "C2"); attempts++) { assert.ok(attempts < 1000, "Requête C2 attendue"); await page.waitForTimeout(10) }
    pending.find(item => item.id === "C2").resolve()
    await page.getByRole("cell", { name: "BETA-LIC", exact: true }).waitFor()
    pending.find(item => item.id === "C1").resolve()
    await page.waitForTimeout(100)
    await page.getByRole("heading", { name: "Fiche Club: Club Beta", exact: true }).waitFor()
    assert.equal(await page.getByText("OLD", { exact: true }).count(), 0)
    assert.equal(await page.getByRole("cell", { name: "BETA-LIC", exact: true }).count(), 1)
    assert.equal(counts.rapid, 2)
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ result: "PASS", counts, browserErrors: errors, scenarios: ["desktop/mobile", "list 0 requests", "loading distinct from success", "licence display and search", "server props refresh one request", "cancel edit no refresh", "503 and manual retry", "rapid club change ignores stale response", "no page overflow"] }, null, 2))
    await fs.writeFile(path.join(evidence, "results.json"), JSON.stringify({ result: "PASS", counts, browserErrors: errors }, null, 2) + "\n")
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
