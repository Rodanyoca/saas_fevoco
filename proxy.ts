import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie"
import { isPendingPasswordRouteAllowed } from "@/lib/auth/session-policy"
import { resolveSession } from "@/lib/auth/session-resolution"
import { authorizeWithSource } from "@/lib/auth/authorization"
import { routePolicy } from "@/lib/auth/route-policy"
import { isMutationOriginAllowed, publicRequestOrigin } from "@/lib/auth/request-origin"
import { getAuthorizationsForUser, getUserById } from "@/lib/users/data"
import { authenticationFailurePath } from "@/lib/auth/failure-navigation"
import { getUnavailableModule } from "@/lib/module-availability"
import { createNavigationSnapshot, NAVIGATION_COOKIE_NAME, UNAVAILABLE_PAGE_HEADER } from "@/lib/navigation-snapshot"
import type { UserAuthorization } from "@/lib/users/types"

function nextPage(request: NextRequest) {
  const headers = new Headers(request.headers)
  // Overwrite client-supplied values; only this real route receives the marker.
  headers.set(UNAVAILABLE_PAGE_HEADER, request.nextUrl.pathname === "/service-indisponible" ? "1" : "0")
  const response = NextResponse.next({ request: { headers } })
  if (request.nextUrl.pathname === "/service-indisponible") response.headers.set("Cache-Control", "private, no-store")
  return response
}

function deny(request: NextRequest, status = 401) {
  const response = request.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.json({ error: status === 503 ? "Service d’authentification indisponible." : status === 403 ? "Accès non autorisé." : "Session invalide." }, { status })
    : NextResponse.redirect(new URL(status === 403 ? "/acces-refuse" : authenticationFailurePath(status), publicRequestOrigin(request)))
  response.headers.set("Cache-Control", "private, no-store")
  return response
}
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const assets = new Set(["/_vercel/insights/script.js", "/favicon.ico", "/logo-fevoco.png", "/icon.svg", "/apple-icon.png", "/icon-dark-32x32.png", "/icon-light-32x32.png", "/placeholder-logo.png", "/placeholder-logo.svg", "/placeholder-user.jpg", "/placeholder.jpg", "/placeholder.svg", "/images/login/volleyball.svg", "/img-20250901-wa01791.jpg"])
  if ((path.startsWith("/_next/") || assets.has(path)) && ["GET", "HEAD"].includes(request.method)) return nextPage(request)
  if (!isMutationOriginAllowed(request)) return deny(request, 403)
  if (["/login", "/confidentialite", "/conditions-utilisation", "/service-indisponible", "/api/auth/login"].includes(path)) return nextPage(request)
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return deny(request)
  // Logout remains possible even when the data source is unavailable.
  if (path === "/api/auth/logout") return nextPage(request)
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) return deny(request, 503)
  const resolution = await resolveSession({ token, secret, loadUser: getUserById })
  if (!resolution.ok) return deny(request, resolution.reason === "SOURCE_UNAVAILABLE" ? 503 : 401)
  if (resolution.requiresActivation && !isPendingPasswordRouteAllowed(path)) {
    if (path.startsWith("/api/")) return deny(request, 403)
    return NextResponse.redirect(new URL("/activation", publicRequestOrigin(request)))
  }
  if (isPendingPasswordRouteAllowed(path) || ["/mon-compte", "/api/auth/change-password", "/acces-refuse"].includes(path)) return nextPage(request)
  const policy = routePolicy(path, request.method)
  if (!policy) return deny(request, 403)
  let confirmedAuthorizations: readonly UserAuthorization[] = []
  const decision = await authorizeWithSource({ user: resolution.user, requirement: policy, action: policy.action, loadAuthorizations: async () => {
    confirmedAuthorizations = await getAuthorizationsForUser(resolution.user.idUser)
    return confirmedAuthorizations
  } })
  if (!decision.allowed) return deny(request, decision.reason === "SOURCE_UNAVAILABLE" ? 503 : 403)
  if (path.startsWith("/api/") && getUnavailableModule(path)) {
    return NextResponse.json({ error: "Bientôt disponible", code: "MODULE_UNAVAILABLE" }, { status: 403, headers: { "Cache-Control": "private, no-store" } })
  }
  const response = nextPage(request)
  response.headers.set("Cache-Control", "private, no-store")
  if (request.method === "GET" && !path.startsWith("/api/")) {
    const expires = resolution.payload.exp
    response.cookies.set(NAVIGATION_COOKIE_NAME, createNavigationSnapshot({ user: resolution.user, authorizations: confirmedAuthorizations, sessionToken: token, expires, secret }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: Math.max(0, expires - Math.floor(Date.now() / 1000)),
    })
  }
  return response
}
// Every dynamic page and API is protected, including identifiers containing dots.
export const config = { matcher: ["/:path*"] }
