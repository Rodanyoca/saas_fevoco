import "server-only"
import { cookies } from "next/headers"
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie"
import { verifySessionToken } from "@/lib/auth/session-token"
import { NAVIGATION_COOKIE_NAME, readNavigationSnapshot } from "@/lib/navigation-snapshot"
import { dashboardNavigation } from "@/lib/navigation"
import { filterNavigation } from "@/lib/auth/navigation-access"

export async function getUnavailableNavigation() {
  const jar = await cookies(), token = jar.get(SESSION_COOKIE_NAME)?.value, secret = process.env.AUTH_SECRET
  if (!token || !secret || !await verifySessionToken({ token, secret })) return []
  const display = readNavigationSnapshot({ value: jar.get(NAVIGATION_COOKIE_NAME)?.value, sessionToken: token, secret })
  return filterNavigation(dashboardNavigation, display)
}
