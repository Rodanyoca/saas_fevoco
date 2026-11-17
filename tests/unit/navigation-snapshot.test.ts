import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { createNavigationSnapshot, readNavigationSnapshot } from "../../lib/navigation-snapshot.ts"
import type { UserAuthorization } from "../../lib/users/types"

const secret = "navigation-display-test-secret-32-characters"
const authorizations: UserAuthorization[] = [{ idUserAutorisation: "A1", idUser: "U1", idBlocAutorisation: "AUT-SPT", statut: "ACTIF", dateDebut: "2000-01-01", dateFin: null }]
const input = { user: { idUser: "U1", typeUser: "VIEWER" as const, estSuperAdmin: false }, authorizations, sessionToken: "session-one", expires: 2_000_000_000, secret }

test("le menu conserve les blocs confirmes sans produire de droit WRITE", () => {
  const result = readNavigationSnapshot({ value: createNavigationSnapshot(input), sessionToken: input.sessionToken, secret, nowSeconds: 1_900_000_000 })!
  assert.equal(result.access["AUT-SPT:READ"], true)
  assert.equal(result.access["AUT-ADM:READ"], false)
  for (const block of ["AUT-SPT", "AUT-ADM", "AUT-COM"]) assert.equal(result.access[`${block}:WRITE`], false)
})

test("une autre session, une alteration ou une echeance depassee invalident le menu", () => {
  const value = createNavigationSnapshot(input)
  const valid = { value, sessionToken: input.sessionToken, secret, nowSeconds: 1_900_000_000 }
  assert.equal(readNavigationSnapshot({ ...valid, sessionToken: "other-session" }), null)
  assert.equal(readNavigationSnapshot({ ...valid, value: value + "x" }), null)
  assert.equal(readNavigationSnapshot({ ...valid, nowSeconds: input.expires }), null)
  assert.equal(readNavigationSnapshot({ ...valid, secret: "another-secret" }), null)
  assert.equal(readNavigationSnapshot({ ...valid, value: undefined }), null)
})

test("le menu super-admin confirme conserve les rubriques de parametrage", () => {
  const value = createNavigationSnapshot({ ...input, user: { ...input.user, typeUser: "ADMIN", estSuperAdmin: true }, authorizations: [] })
  const result = readNavigationSnapshot({ value, sessionToken: input.sessionToken, secret, nowSeconds: 1_900_000_000 })!
  assert.equal(result.estSuperAdmin, true)
  assert.equal(result.access["AUT-ADM:READ"], true)
  assert.equal(result.access["AUT-ADM:WRITE"], false)
})
