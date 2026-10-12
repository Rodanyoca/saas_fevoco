import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node native TypeScript imports.
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "../../lib/auth/session-cookie.ts"
test("FEVOCO session cookie is HttpOnly, scoped and secure in production",()=>{
 assert.equal(SESSION_COOKIE_NAME,"fevoco_session")
 assert.deepEqual(sessionCookieOptions(true),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:28800})
 assert.equal(sessionCookieOptions(false).secure,false)
})
