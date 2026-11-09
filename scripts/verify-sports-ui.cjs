/* eslint-disable @typescript-eslint/no-require-imports -- Isolated real-component browser tests. */
/* global require, __dirname, console, process, document, innerWidth */
const fs = require('node:fs/promises'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict')
const { webpack } = require('next/dist/compiled/webpack/webpack'), { chromium } = require('@playwright/test')
async function main() {
  const root = path.resolve(__dirname, '..'), out = path.join(root, '.next/cache/sports-ui-20261105'), evidence = path.join(root, 'docs/performance/sports-ui-2026-11-05')
  await fs.mkdir(out, {recursive:true}); await fs.mkdir(evidence, {recursive:true})
  await fs.writeFile(path.join(out,'loader.cjs'), `const ts=require(${JSON.stringify(require.resolve('typescript'))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText}`)
  await fs.writeFile(path.join(out,'navigation.ts'), 'export const useRouter=()=>({refresh(){}});')
  await fs.writeFile(path.join(out,'entry.jsx'), `import React from 'react';import{createRoot}from'react-dom/client';import{AthleteTransfersPanel}from'@/components/athletes/athlete-transfers-panel';import{AthleteLicenceEditor}from'@/components/licences/athlete-licence-editor';const refs={sportsWritesEnabled:true,clubs:[{id:'0101001',label:'Club Alpha'},{id:'0101058',label:'Club Beta'},{id:'0101003',label:'Club Gamma'},{id:'701019',label:'Club invalide'}],seasons:[{id:'SAI006',label:'Saison test'}],statuses:[{id:'STL001',label:'ACTIF'}],candidates:[{clubId:'0101058',affiliationId:'AFA-TEST-198',athleteId:'ATH00198',athleteName:'Athlète synthétique Beta',dateDebut:'2025-01-01',dateFin:'',affiliationStatus:'ACTIF'},{clubId:'0101001',affiliationId:'AFA-000001',athleteId:'ATH00001',athleteName:'Athlète synthétique',dateDebut:'2026-01-01',dateFin:'',affiliationStatus:'ACTIF'}]};function App(){const[open,setOpen]=React.useState(false);return <main className="p-4"><AthleteTransfersPanel actorId="ATH00001"/><button onClick={()=>setOpen(true)}>Ouvrir licence</button><AthleteLicenceEditor open={open} onOpenChange={setOpen} references={refs} rows={[]} editing={null} readOnly={false} mode="ATHLETE" initialSeason="SAI006" onSaved={()=>{}}/></main>}createRoot(document.getElementById('root')).render(<App/>);`)
  if (!process.argv.includes("--reuse-bundle")) await new Promise((resolve,reject)=>{const compiler=webpack({mode:'development',devtool:false,entry:path.join(out,'entry.jsx'),output:{path:out,filename:'bundle.js'},resolve:{alias:{'next/navigation':path.join(out,'navigation.ts'),'@':root},extensions:['.tsx','.ts','.js']},module:{rules:[{test:/\.tsx?$|entry\.jsx$/,use:path.join(out,'loader.cjs')}]}});compiler.run((error,stats)=>compiler.close(()=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()))})
  const cssDir=path.join(root,'.next/static/chunks'), css=(await Promise.all((await fs.readdir(cssDir)).filter(x=>x.endsWith('.css')).map(x=>fs.readFile(path.join(cssDir,x),'utf8')))).join('\n')
  const server=http.createServer(async(req,res)=>{if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(await fs.readFile(path.join(out,'bundle.js')));return}if(req.url==='/style.css'){res.setHeader('Content-Type','text/css');res.end(css);return}res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<html lang="fr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"development"},browser:true}</script><script src="/bundle.js"></script></body></html>')})
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); let browser
  const errors=[], results=[]
  try {
    browser=await chromium.launch({headless:true})
    for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
      const page=await browser.newPage({viewport});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));const posted=[];let reads=0
      await page.route('**/api/**',async route=>{
        const req=route.request()
        if(req.method()==='GET'){reads++;await route.fulfill({contentType:'application/json',body:JSON.stringify({affiliations:[{id:'AFA-000001',clubId:'0101001',structure:'Club Alpha',dateDebut:'2026-01-01',dateFin:'',statusId:'SAF001',statut:'Actif',observations:'',transferType:'Non renseigné',transferTypeId:'',previousAffiliationId:'',transferRole:'LEGACY',temporalState:'Actuel'}],references:{sportsWritesEnabled:true,clubs:[{id:'0101001',label:'Club Alpha'},{id:'701019',label:'Club invalide'}],statuses:[{id:'SAF001',label:'Actif'}],transferTypes:[{id:'TRF001',label:'PREMIERE_AFFILIATION'},{id:'TRF002',label:'CESSION_TEMPORAIRE'}]}})});return}
        posted.push(JSON.parse(req.postData()));await route.fulfill({status:posted.length===1?503:201,contentType:'application/json',body:JSON.stringify(posted.length===1?{code:'RESULTAT_INDETERMINE',message:'Résultat non confirmé'}:{licence:{numero_licence:'0101001001'}})})
      })
      await page.goto(`http://127.0.0.1:${server.address().port}`);await page.getByText('Non renseigné',{exact:true}).filter({visible:true}).first().waitFor();assert.equal(reads,1)
      await page.screenshot({path:path.join(evidence,name+'-transfers.png'),fullPage:true})
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
      await page.getByRole('button',{name:'Ajouter un mouvement'}).click();await page.getByRole('dialog').waitFor();assert.equal(reads,1,'Formulaire sans lecture supplémentaire')
      await page.getByLabel('Type d’opération *',{exact:true}).click();await page.getByRole('option',{name:'CESSION_TEMPORAIRE',exact:true}).click()
      assert.equal(await page.getByLabel('Date de fin de cession *',{exact:true}).getAttribute('required'),'')
      await page.getByLabel('Rattachement précédent *',{exact:true}).waitFor()
      await page.getByLabel('Date de début *',{exact:true}).fill('31022026');assert.equal(await page.getByLabel('Date de début *',{exact:true}).inputValue(),'31/02/2026')
      await page.getByRole('dialog').locator('form').getByRole('button',{name:'Fermer',exact:true}).click()
      await page.getByRole('button',{name:'Ouvrir licence'}).click();const dialog=page.getByRole('dialog')
      assert.equal(await dialog.getByLabel('Numéro de licence',{exact:true}).getAttribute('readonly'),'')
      await dialog.getByLabel('Club *',{exact:true}).fill('Cl');await page.getByRole('button',{name:/^Club Alpha/}).click();assert.equal(await page.getByText('Club invalide',{exact:true}).count(),0)
      await dialog.getByLabel('Athlète *',{exact:true}).fill('ancienne recherche')
      await dialog.getByLabel('Club *',{exact:true}).fill('Cl');await page.waitForTimeout(200);await page.getByRole('button',{name:/^Club Beta/}).click()
      assert.equal(await dialog.getByLabel('Athlète *',{exact:true}).inputValue(),'','Changer de club efface la recherche de l’ancien club')
      await dialog.getByLabel('Athlète *',{exact:true}).fill('ATH00198');await page.getByRole('button',{name:/^Athlète synthétique Beta/}).waitFor()
      await dialog.getByLabel('Athlète *',{exact:true}).fill('At')
      assert.equal(await dialog.getByText('AFA-000001',{exact:true}).count(),0)
      await dialog.getByLabel('Club *',{exact:true}).fill('Cl');await page.getByRole('button',{name:/^Club Gamma/}).click()
      await dialog.getByText('Aucun athlète affilié à ce club.',{exact:true}).waitFor()
      assert.equal(reads,1,'Le changement de club ne relit pas les sources')
      assert.equal(posted.length,0,'Aucune écriture pendant la recherche')
      await dialog.getByLabel('Club *',{exact:true}).fill('Cl');await page.getByRole('button',{name:/^Club Alpha/}).click()
      await dialog.getByLabel('Athlète *',{exact:true}).fill('At');await page.getByRole('button',{name:/^Athlète synthétique/}).click()
      await dialog.getByLabel('Date de délivrance *',{exact:true}).fill('01052026');assert.equal(await dialog.getByLabel('Date de délivrance *',{exact:true}).inputValue(),'01/05/2026')
      await page.screenshot({path:path.join(evidence,name+'-licence.png'),fullPage:true})
      await dialog.getByRole('button',{name:'Enregistrer la licence',exact:true}).click();await dialog.getByText('Résultat non confirmé',{exact:true}).waitFor()
      await dialog.getByRole('button',{name:'Vérifier cette tentative',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.deepEqual(posted[0],posted[1]);assert.equal(posted[0].numero_licence,undefined);assert.ok(posted[0].idempotency_key)
      results.push({viewport:name,reads,writesSimulated:posted.length,stableRetry:true});await page.close()
    }
    assert.deepEqual(errors,[]);await fs.writeFile(path.join(evidence,'results.json'),JSON.stringify({result:'PASS',results,errors,synthetic:true},null,2)+'\n');console.log(JSON.stringify({result:'PASS',results,errors}))
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(e=>{console.error(e);process.exitCode=1})
