import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { routePolicy } from "../../lib/auth/route-policy.ts"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { authorize } from "../../lib/auth/authorization.ts"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { isMutationOriginAllowed } from "../../lib/auth/request-origin.ts"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { filterNavigation } from "../../lib/auth/navigation-access.ts"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { dashboardNavigation } from "../../lib/navigation.ts"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { normalizeLoginRedirect } from "../../lib/auth/login-redirect.ts"
test("FEVOCO protects every existing API and page module and denies unknown paths", () => {
  for (const path of ["/", "/clubs/CLB-1", "/licences/entourage", "/suivi-equipe-nationale", "/api/actors/coachs/1/avatar", "/api/avatars/image.jpg", "/api/affiliations/coach", "/api/competitions/1/close", "/api/club-logos/file"]) assert.ok(routePolicy(path), path)
  assert.equal(routePolicy("/api/auth/unknown"), null)
  assert.equal(routePolicy("/visual-club-preview"), null)
  assert.equal(routePolicy("/api/competitions/1/close", "POST")?.action, "WRITE")
  assert.equal(routePolicy("/api/athletes", "GET")?.action, "READ")
  assert.equal(routePolicy("/clubs/nouveau")?.action, "WRITE")
  assert.equal(routePolicy("/parametres")?.scope, "SUPER_ADMIN")
})
test("viewer cannot mutate FEVOCO data, even with an explicit sport authorization", () => {
  const user = {idUser:"TEST",typeUser:"VIEWER",estSuperAdmin:false} as const
  const authorizations = [{idUserAutorisation:"TEST-A",idUser:"TEST",idBlocAutorisation:"AUT-SPT",statut:"ACTIF",dateDebut:"2026-01-01",dateFin:null}] as const
  const policy = routePolicy("/api/licences/athletes","POST")!
  assert.equal(authorize({user,authorizations,requirement:policy,action:policy.action,date:"2026-10-12"}).allowed,false)
})
test("cross-origin mutations and missing origins are denied", () => {
  for (const origin of ["https://evil.example", "null", ""]) assert.equal(isMutationOriginAllowed(new Request("https://fevoco.example/api/auth/login",{method:"POST",headers:origin?{origin}:{}})),false)
  assert.equal(isMutationOriginAllowed(new Request("https://fevoco.example/api/auth/login",{method:"POST",headers:{origin:"https://fevoco.example"}})),true)
  assert.equal(isMutationOriginAllowed(new Request("https://fevoco.example/api/athletes")),true)
})
test("navigation contains only granted sections and redirects cannot leave the app", () => {
  assert.deepEqual(filterNavigation(dashboardNavigation,null),[])
  const menu=filterNavigation(dashboardNavigation,{estSuperAdmin:false,access:{"AUT-SPT:READ":true}})
  assert.ok(menu.some(item=>item.name==="Acteurs"))
  assert.ok(!menu.some(item=>item.name==="Paramètres" || item.name==="Administration"))
  for (const redirect of ["https://evil.example","//evil.example","/dashboard"]) assert.equal(normalizeLoginRedirect(redirect),"/")
})

test("original browser host is preserved when Next normalizes loopback URLs",()=>{
 assert.equal(isMutationOriginAllowed(new Request("http://localhost:3107/api/auth/login",{method:"POST",headers:{host:"127.0.0.1:3107",origin:"http://127.0.0.1:3107"}})),true)
 assert.equal(isMutationOriginAllowed(new Request("http://internal:3000/api/auth/login",{method:"POST",headers:{host:"fevoco.example","x-forwarded-proto":"https",origin:"https://fevoco.example"}})),true)
})
