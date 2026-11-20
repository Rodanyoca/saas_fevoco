/* eslint-disable @typescript-eslint/no-require-imports -- Browser fixture without production access. */
/* global require, __dirname, console, process, document, window */
const fs = require("node:fs/promises"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict")
const { webpack } = require("next/dist/compiled/webpack/webpack"), { chromium } = require("@playwright/test")
const { harness } = require("../tests/helpers/sports-harness.cjs")
async function main() {
  const root = path.resolve(__dirname, ".."), out = path.join(root, ".next/cache/athlete-attachment-ui"), evidence = path.join(root, "docs/verification/athlete-attachment")
  await fs.mkdir(out, { recursive: true }); await fs.mkdir(evidence, { recursive: true })
  await fs.writeFile(path.join(out, "loader.cjs"), `const ts=require(${JSON.stringify(require.resolve("typescript"))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out, "navigation.ts"), "export const useRouter=()=>({refresh(){}});")
  await fs.writeFile(path.join(out, "entry.jsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{AthleteTransfersPanel}from'@/components/athletes/athlete-transfers-panel';import{AthleteLicencesClient}from'@/components/licences/athlete-licences-client';createRoot(document.getElementById('root')).render(<><AthleteTransfersPanel actorId="ATH00001"/><AthleteLicencesClient rows={[]} error="" creation={{clubs:[],seasons:[]}}/></>);`)

  await new Promise((resolve, reject) => { const compiler = webpack({ mode: "development", devtool: false, entry: path.join(out, "entry.jsx"), output: { path: out, filename: "bundle.js" }, resolve: { alias: { "next/navigation": path.join(out, "navigation.ts"), "@": root }, extensions: [".tsx", ".ts", ".js"] }, module: { rules: [{ test: /\.tsx?$|entry\.jsx$/, use: path.join(out, "loader.cjs") }] } }); compiler.run((error, stats) => compiler.close(() => error || stats.hasErrors() ? reject(error || new Error(stats.toString({ all: false, errors: true }))) : resolve())) })
  const cssDir = path.join(root, ".next/static/chunks"), css = (await Promise.all((await fs.readdir(cssDir)).filter(name => name.endsWith(".css")).map(name => fs.readFile(path.join(cssDir, name), "utf8")))).join("\n")
  const server = http.createServer(async (req, res) => {
    if (req.url === "/bundle.js") { res.setHeader("Content-Type", "text/javascript"); return res.end(await fs.readFile(path.join(out, "bundle.js"))) }
    if (req.url === "/style.css") { res.setHeader("Content-Type", "text/css"); return res.end(css) }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end('<html lang="fr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><main class="p-4"><div id="root"></div></main><script>window.process={env:{NODE_ENV:"development"},browser:true}</script><script src="/bundle.js"></script></body></html>')
  })
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  let browser
  const results=[],errors=[]
  try {
    browser=await chromium.launch({headless:true})
    for (const [name,viewport] of [["desktop",{width:1440,height:1000}],["mobile",{width:390,height:844}]]) for (const scenario of ["normal","partial"]) {
      const h=harness({onboarding:true,management:true}),domain=h.loadModule("lib/athlete-attachment.ts")
      h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length=1
      const page=await browser.newPage({viewport});page.setDefaultTimeout(60000)
      page.on("pageerror",error=>errors.push(error.message))
      let gets=0;const posted=[]
      if (scenario === "partial") h.state.failBook="LIC"
      await page.route("**/api/affiliations/athlete**",async route=>{
        const req=route.request()
        if(req.method()==="GET") {gets++;return route.fulfill({json:{affiliations:[],references:{clubs:[{id:"0101001",label:"Club Alpha"}],statuses:[{id:"SAF001",label:"ACTIF"}],functions:[],entityTypes:[],entities:{},seasons:[],transferTypes:[{id:"TRF001",label:"Première affiliation"}],currentSeason:{id:"SAI006",label:"Saison 2026"},sportsWritesEnabled:true}}})}
        const input=req.postDataJSON();posted.push(input)
        try {
          const result=await domain.runAthleteAttachment(h.createStore(),h.operation(input.idempotency_key,input),input.actorId,input,"2026-06-01")
          return route.fulfill({json:{affiliation:{id:result.affiliation.id_affiliation_athlete},licence:{numero:result.licence.numero_licence,seasonId:result.licence.id_saison,club:"Club Alpha"}}})
        } catch(error) {h.state.failBook="";return route.fulfill({status:error.status||503,json:{message:error.message,uncertain:error.uncertain}})}
      })
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      assert.equal(await page.getByText("Licences enregistrées",{exact:true}).count(),0)
      assert.equal(await page.getByRole("button",{name:/Ajouter une licence|Renouveler par club/}).count(),0)
      await page.getByRole("button",{name:"Ajouter un mouvement"}).click()
      await page.getByRole("dialog").waitFor()
      assert.ok((await page.getByRole("dialog").innerText()).includes("Saison 2026"))
      await page.locator("#transfer-id_type_transfert").click()
      await page.getByRole("option",{name:"Première affiliation"}).click()
      await page.locator("#transfer-club").fill("Al")
      await page.getByRole("button",{name:/Club Alpha/}).click()
      await page.locator("#transfer-date_debut").pressSequentially("01012026")
      assert.equal(await page.locator("#transfer-date_debut").inputValue(),"01/01/2026")
      await page.locator("#transfer-date_debut").fill("31/02/2026")
      await page.getByRole("button",{name:"Confirmer",exact:true}).click()
      assert.equal(posted.length,0,"impossible date must be stopped before request")
      await page.locator("#transfer-date_debut").fill("01/01/2026")
      await page.keyboard.press("Tab")
      await page.screenshot({path:path.join(evidence,name+"-"+scenario+"-form.png"),fullPage:true})
      await page.getByRole("button",{name:"Confirmer",exact:true}).click()
      if (scenario === "partial") {
        await page.getByRole("button",{name:"Vérifier cette tentative",exact:true}).waitFor()
        assert.equal(await page.locator("#transfer-date_debut").inputValue(),"01/01/2026")
        await page.getByRole("button",{name:"Vérifier cette tentative",exact:true}).click()
        assert.equal(posted[0].idempotency_key,posted[1].idempotency_key)
      }
      await page.getByRole("dialog").waitFor({state:"hidden"})
      assert.equal(posted.length,scenario === "partial" ? 2 : 1)
      assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length,2)
      assert.equal(h.books.ACT.sheets.ATHLETES.values.length,3)
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth))
      results.push({name,scenario,gets,posts:posted.length,licences:1,identityUnchanged:true,manualFormAbsent:true})
      await page.close()
    }
    assert.deepEqual(errors,[])
    await fs.writeFile(path.join(evidence,"results.json"),JSON.stringify({results,errors,productionWrites:0},null,2))
    console.log(JSON.stringify(results))
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1})
