/* global require, Request, console */
/* eslint-disable @typescript-eslint/no-require-imports -- Isolated real sports services. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")
const key = n => `${String(n).padStart(8, "0")}-1111-4111-8111-111111111111`
function setup(overrides = {}) {
  const h = harness({onboarding:true,management:true,overrides})
  h.books.REF.sheets.STATUT_LICENCE.values.push(["STL003"],["STL004"],["STL005"])
  const domain = h.loadModule("lib/athlete-attachment.ts")
  const command = (input, n = 1, date = "2026-06-01", actor = "ATH00001") => domain.runAthleteAttachment(h.createStore(), h.operation(key(n), {actor,input}), actor, input, date)
  const rows = (book, table) => {const [headers,...values] = h.books[book].sheets[table].values;return values.filter(row => row.some(Boolean)).map(row => Object.fromEntries(headers.map((key,i) => [key,row[i] || ""]))) }
  return {...h,command,rows}
}
const first = {id_type_transfert:"TRF001",id_club:"0101001",date_debut:"2026-01-01",date_fin:"",id_statut_affiliation:"SAF001",id_affiliation_precedente:""}
const transfer = { ...first,id_type_transfert:"TRF003",id_club:"0101002",date_debut:"2026-06-01",id_affiliation_precedente:"AFA-000001" }
test("historical identity: affiliation and licence without identity writes; replay identical", async () => {
  const h=setup();h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length=1
  const original=JSON.stringify(h.books.ACT), result=await h.command(first)
  assert.equal(result.licence.id_affiliation_athlete,result.affiliation.id_affiliation_athlete)
  assert.equal(result.affiliation.date_debut,"2026-01-01")
  assert.equal(result.licence.numero_licence,"0101001001")
  assert.equal(JSON.stringify(h.books.ACT),original)
  assert.equal((await h.command(first)).licence.id_licence,result.licence.id_licence)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").length,1)
  console.log("attachment fixture",JSON.stringify({reads:h.reads.length,businessBatches:h.calls.filter(call=>call.business).length}))
})
test("permanent transfer: close previous atomically, retain history and allocate arrival club",async()=>{
  const h=setup();await h.run();const result=await h.command(transfer)
  const rows=h.rows("LIC","ATHLETE_LICENCES")
  assert.equal(rows.length,2);assert.equal(rows[0].id_statut_licence,"STL004")
  assert.equal(rows[0].numero_licence,"0101001001");assert.equal(result.licence.numero_licence,"0101002001")
  const active=rows.filter(row=>row.id_statut_licence==="STL001");assert.equal(active.length,1)
  const snapshot=await h.createStore().load("attachment"),mapper=h.loadModule("lib/mappers/actor-records.ts"),reader=h.loadModule("lib/active-actor-licences.ts")
  const mapped=rows.map(row=>mapper.mapAthleteLicence(row,snapshot.seasons.find(season=>season.id_saison===row.id_saison)))
  assert.equal(reader.activeActorLicenceNumbers(mapped,"2026-06-01").get("ATH00001"),result.licence.numero_licence)
  const batch=h.calls.filter(call=>call.business&&call.spreadsheetId==="LIC").at(-1)
  assert.ok(batch.requests.some(r=>r.updateCells));assert.ok(batch.requests.some(r=>r.appendCells))
})
test("temporary loan and return allocate new numbers without reactivating old licences",async()=>{
  const h=setup();await h.run()
  const loan=await h.command({...transfer,id_type_transfert:"TRF002",date_fin:"2026-06-30"})
  assert.equal(h.rows("LIC","ATHLETE_LICENCES")[0].id_statut_licence,"STL003")
  const returned=await h.command({action:"RETURN",id_type_transfert:"TRF002",id_affiliation_precedente:loan.affiliation.id_affiliation_athlete,date_debut:"2026-07-01",date_fin:"",id_statut_affiliation:"SAF001"},2,"2026-07-01")
  assert.equal(returned.licence.numero_licence,"0101001002")
  const rows=h.rows("LIC","ATHLETE_LICENCES");assert.equal(rows.filter(row=>row.id_statut_licence==="STL001").length,1)
  assert.equal(rows[1].id_statut_licence,"STL003")
})
test("active previous season is explicitly closed; inactive same season history allowed",async()=>{
  const h=setup();await h.run();h.books.LIC.sheets.ATHLETE_LICENCES.values[1][2]="OLD";h.books.LIC.metadata=h.books.LIC.metadata.filter(row=>!row.metadataKey.includes("athlete-season:"))
  await h.command(transfer);assert.equal(h.rows("LIC","ATHLETE_LICENCES")[0].id_statut_licence,"STL004")
})
for(const book of ["AFF","LIC"]) test(`resume partial ${book} without duplicate`,async()=>{
  const h=setup();await h.run();h.state.failBook=book
  await assert.rejects(h.command(transfer),error=>error.uncertain)
  assert.ok(h.rows("LIC","ATHLETE_LICENCES").filter(row=>row.id_statut_licence==="STL001").length<=1)
  h.state.failBook="";await h.command(transfer)
  assert.equal(h.rows("AFF","ATHLETE_AFFILIATIONS").filter(row=>row.id_athlete==="ATH00001").length,2)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").length,2)
})
for(const book of ["AFF","LIC"]) test(`lost response ${book}: check receipt before retry`,async()=>{
  const h=setup();await h.run();h.state.failAfterBook=book
  await assert.rejects(h.command(transfer))
  h.state.failAfterBook="";h.state.hideReceiptBook="";h.state.hideGetBook=""
  await h.command(transfer)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").length,2)
})
test("double click and concurrent independent movements: one evolution",async()=>{
  const h=setup();await h.run()
  const results=await Promise.allSettled([h.command(transfer),h.command(transfer,2)])
  assert.equal(results.filter(row=>row.status==="fulfilled").length,1)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").filter(row=>row.id_statut_licence==="STL001").length,1)
})
for(const patch of [{date_debut:"2027-01-01"},{date_fin:"2026-05-01"},{id_club:"UNKNOWN"}]) test("invalid period/club before business writes "+JSON.stringify(patch),async()=>{
  const h=setup();h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length=1
  await assert.rejects(h.command({...first,...patch}))
  assert.equal(h.calls.filter(call=>call.business).length,0)
})
test("blocked counter prevalidated before affiliation; deleted result never recreated",async()=>{
  const h=setup();await h.run();const result=await h.command(transfer)
  h.books.LIC.sheets.ATHLETE_LICENCES.values.pop()
  await assert.rejects(h.command(transfer));assert.equal(h.rows("LIC","ATHLETE_LICENCES").length,1)
  assert.ok(result.licence.id_licence)
})
test("ordinary status edit cannot reactivate second licence",async()=>{
  const h=setup();await h.run();await h.command(transfer)
  const domain=h.loadModule("lib/sports-licences-domain.ts"),s=await h.createStore().load("attachment"),old=s.licences[0]
  assert.throws(()=>domain.modifySportsLicence(s,old.id_licence,{date_delivrance:old.date_delivrance,id_statut_licence:"STL001"}),error=>error.code==="LICENCE_ACTIVE_EXISTANTE")
})
test("manual API refused and anonymous creation denied",async()=>{
  const h=setup(),api=h.loadModule("app/api/licences/athletes/route.ts")
  const req=()=>new Request("https://fevoco.test/api/licences/athletes",{method:"POST",headers:{origin:"https://fevoco.test","Content-Type":"application/json"},body:"{}"})
  assert.equal((await api.POST(req())).status,410)
  h.state.noSession=true;assert.equal((await api.POST(req())).status,401)
  assert.equal(h.calls.filter(call=>call.business).length,0)
})
test("affiliation API enforces session, origin and sports WRITE before writes",async()=>{
  const h=setup(),api=h.loadModule("app/api/affiliations/[kind]/route.ts")
  const request=(origin="https://fevoco.test")=>new Request("https://fevoco.test/api/affiliations/athlete",{method:"POST",headers:{origin,"Content-Type":"application/json"},body:JSON.stringify({...first,actorId:"ATH00001",idempotency_key:key(9)})})
  const context={params:Promise.resolve({kind:"athlete"})}
  for(const [flag,status] of [["noSession",401],["activation",401],["denyWrite",403]]) {h.state[flag]=true;assert.equal((await api.POST(request(),context)).status,status);h.state[flag]=false}
  assert.equal((await api.POST(request("https://invalid.test"),context)).status,403)
  assert.equal(h.calls.filter(call=>call.business).length,0)
})
test("ordinary affiliation edit does not issue a licence",async()=>{
  const h=setup();await h.run()
  const count=h.calls.filter(call=>call.business&&call.spreadsheetId==="LIC").length
  await h.mutateAthleteTransfer("ATH00001",{...first,id_type_transfert:"",observations:"Correction",idempotency_key:key(9)},"AFA-000001")
  assert.equal(h.calls.filter(call=>call.business&&call.spreadsheetId==="LIC").length,count)
})
test("all active historic licences are retired even across seasons",async()=>{
  const h=setup();await h.run()
  const old=h.books.LIC.sheets.ATHLETE_LICENCES.values[1]
  h.books.LIC.sheets.ATHLETE_LICENCES.values.push(old.map((value,index)=>index===0?"OLD-ID":index===2?"OLDER":index===4?"0101001099":index===9?"99":value))
  await h.command(transfer)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").filter(row=>row.id_statut_licence==="STL001").length,1)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").filter(row=>row.id_statut_licence==="STL004").length,2)
})
for(const scenario of ["counter","season","reservation","affiliation-conflict"]) test("prevalidate "+scenario+" without business write",async()=>{
  const h=setup();h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length=1
  if(scenario==="counter") h.books.LIC.sheets.COMPTEURS_LICENCES.values.push(["CPT-SAI006-0101001","0101001","SAI006","9","A_VERIFIER",""])
  if(scenario==="season") h.books.REF.sheets.SAISON.values[1][3]="STS005"
  if(scenario==="reservation") h.books.LIC.metadata.push({metadataId:145,metadataKey:"fevoco:sports:v1:athlete-season:ATH00001:SAI006",metadataValue:"unknown",visibility:"DOCUMENT"})
  if(scenario==="affiliation-conflict") h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.push(["AFA-001000","ATH00001","0101002","2026-01-01","","SAF001","","",""])
  const metadata=JSON.stringify(h.books.LIC.metadata)
  await assert.rejects(h.command(first))
  assert.equal(h.calls.filter(call=>call.business).length,0)
  assert.equal(JSON.stringify(h.books.LIC.metadata),metadata)
})
test("same operation submitted concurrently cannot allocate twice",async()=>{
  const h=setup();await h.run()
  await Promise.allSettled([h.command(transfer),h.command(transfer)])
  const result=await h.command(transfer)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").length,2)
  assert.equal(result.licence.numero_licence,"0101002001")
})
test("individual licence GET and PUT preserve identity, affiliation, season and number",async()=>{
  const h=setup({"@/lib/env":{isLicencesGoogleSheetsConfigured:()=>true}});await h.run()
  const api=h.loadModule("app/api/licences/athletes/route.ts"),old=h.rows("LIC","ATHLETE_LICENCES")[0]
  const origin="https://fevoco.test"
  const response=await api.GET(new Request(origin+"/api/licences/athletes?edit="+old.id_licence,{headers:{origin}}))
  assert.equal(response.status,200);const editable=await response.json()
  const previous=JSON.stringify(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values)
  const result=await api.PUT(new Request(origin+"/api/licences/athletes",{method:"PUT",headers:{origin,"Content-Type":"application/json","If-Match":editable.version},body:JSON.stringify({id:old.id_licence,date_delivrance:editable.date,id_statut_licence:"STL003",observations:"Correction",idempotency_key:key(12)})}))
  assert.equal(result.status,200)
  assert.equal(JSON.stringify(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values),previous)
  const updated=h.rows("LIC","ATHLETE_LICENCES")[0]
  for(const field of ["id_licence","id_athlete","id_affiliation_athlete","id_club_attribution","id_saison","numero_licence"]) assert.equal(updated[field],old[field])
  assert.equal(updated.id_statut_licence,"STL003")
})
test("intentional deletion is terminal, keeps number reserved and does not strand an actor lock",async()=>{
  const h=setup();await h.run();const created=await h.command(transfer)
  const service=h.loadModule("lib/record-management.ts"),target={entity:"licence",family:"athlete",id:created.licence.id_licence}
  const preview=await service.previewManagedRecord(target)
  await service.deleteManagedRecord(target,preview.version,key(15),"U1")
  const counters=JSON.stringify(h.books.LIC.sheets.COMPTEURS_LICENCES.values)
  await assert.rejects(h.command(transfer),error=>error.code==="SUPPRESSION_VOLONTAIRE")
  assert.equal(JSON.stringify(h.books.LIC.sheets.COMPTEURS_LICENCES.values),counters)
  assert.ok(h.books.LIC.metadata.some(row=>row.metadataKey.includes("number:SAI006:0101002001")))
  assert.equal(h.books.AFF.metadata.filter(row=>row.metadataKey.includes("lock:")).length,0)
  assert.equal(h.rows("LIC","ATHLETE_LICENCES").length,1)
})
