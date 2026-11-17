import { createHash, createHmac, timingSafeEqual } from "node:crypto"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { authorize, kinshasaCalendarDate } from "./auth/authorization.ts"
import type { User, UserAuthorization } from "./users/types"

export const NAVIGATION_COOKIE_NAME = "fevoco_navigation"
export const UNAVAILABLE_PAGE_HEADER = "x-fevoco-unavailable-page"
const blocks = ["AUT-ADM", "AUT-SPT", "AUT-COM"] as const
const purpose = "fevoco-navigation-display-v1:"
const fingerprint = (token: string) => createHash("sha256").update(token).digest("hex")
const sign = (value: string, secret: string) => createHmac("sha256", secret).update(purpose + value).digest()

// Display context only. Never consult this cookie to authorize a request.
export function createNavigationSnapshot(input: {
  user: Pick<User, "idUser" | "typeUser" | "estSuperAdmin">
  authorizations: readonly UserAuthorization[]
  sessionToken: string; expires: number; secret: string
}) {
  const date = kinshasaCalendarDate()
  const snapshot = {
    session: fingerprint(input.sessionToken), expires: input.expires,
    readable: blocks.map(block => authorize({ user: input.user, authorizations: input.authorizations, requirement: { scope: "BUSINESS", blocks: [block] }, action: "READ", date }).allowed),
    superAdmin: input.user.estSuperAdmin,
  }
  const value = Buffer.from(JSON.stringify(snapshot)).toString("base64url")
  return `${value}.${sign(value, input.secret).toString("base64url")}`
}

export function readNavigationSnapshot(input: { value?: string; sessionToken?: string; secret?: string; nowSeconds?: number }) {
  if (!input.value || !input.sessionToken || !input.secret || input.value.length > 1500) return null
  try {
    const [value, signature, extra] = input.value.split(".")
    if (!value || !signature || extra !== undefined) return null
    const actual = Buffer.from(signature, "base64url"), expected = sign(value, input.secret)
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const snapshot = JSON.parse(Buffer.from(value, "base64url").toString("utf8"))
    if (snapshot.session !== fingerprint(input.sessionToken) || !Number.isSafeInteger(snapshot.expires) || snapshot.expires <= (input.nowSeconds ?? Math.floor(Date.now() / 1000))) return null
    if (!Array.isArray(snapshot.readable) || snapshot.readable.length !== blocks.length || snapshot.readable.some((value: unknown) => typeof value !== "boolean") || typeof snapshot.superAdmin !== "boolean") return null
    return {
      estSuperAdmin: snapshot.superAdmin as boolean,
      access: Object.fromEntries(blocks.flatMap((block, index) => [[`${block}:READ`, snapshot.readable[index]], [`${block}:WRITE`, false]])),
    }
  } catch { return null }
}
