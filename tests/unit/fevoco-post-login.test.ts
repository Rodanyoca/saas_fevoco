import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node native TypeScript imports.
import { postLoginRoute } from "../../lib/auth/post-login-route.ts"
import type { User, UserAuthorization } from "../../lib/users/types.ts"
const user:User={idUser:"TEST",nomComplet:"Test",email:"test@example.org",passwordHash:"unused",typeUser:"ADMIN",estSuperAdmin:false,doitChangerMotDePasse:false,statut:"ACTIF",dateCreation:"2026-10-12T00:00:00Z",dateModificationMotDePasse:null,derniereConnexion:null,sessionVersion:1,dateExpirationAccesTemporaire:null}
function assignment(block:UserAuthorization["idBlocAutorisation"]):UserAuthorization{return {idUserAutorisation:"TEST-A",idUser:user.idUser,idBlocAutorisation:block,statut:"ACTIF",dateDebut:"2026-01-01",dateFin:null}}
test("temporary access is directed to activation even for a super administrator",()=>{
 assert.equal(postLoginRoute({...user,doitChangerMotDePasse:true,estSuperAdmin:true},[],"2026-10-12"),"/activation")
})
test("landing page follows FEVOCO blocks and expired grants give no access",()=>{
 assert.equal(postLoginRoute({...user,estSuperAdmin:true},[],"2026-10-12"),"/")
 assert.equal(postLoginRoute(user,[assignment("AUT-SPT")],"2026-10-12"),"/")
 assert.equal(postLoginRoute(user,[assignment("AUT-ADM")],"2026-10-12"),"/activites")
 assert.equal(postLoginRoute(user,[assignment("AUT-COM")],"2026-10-12"),"/mon-compte")
 assert.equal(postLoginRoute(user,[{...assignment("AUT-SPT"),dateFin:"2026-10-11"}],"2026-10-12"),"/mon-compte")
})
