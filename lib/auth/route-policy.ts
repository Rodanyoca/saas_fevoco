import type { AuthorizationAction, AuthorizationRequirement } from "./authorization.ts"
export type RoutePolicy = AuthorizationRequirement & { action: AuthorizationAction; id: string }
type Rule = { id: string; pattern: RegExp; requirement: AuthorizationRequirement; action?: AuthorizationAction }
const SPT = { scope: "BUSINESS", blocks: ["AUT-SPT"] } as const
const ADM = { scope: "BUSINESS", blocks: ["AUT-ADM"] } as const
const SUPER_ADMIN = { scope: "SUPER_ADMIN" } as const
export const ROUTE_RULES: readonly Rule[] = [
  { id: "settings", pattern: /^\/(?:api\/)?parametres(?:\/.*)?$/, requirement: SUPER_ADMIN },
  { id: "administration", pattern: /^\/(?:api\/)?(?:activites|activities|documents)(?:\/.*)?$/, requirement: ADM },
  { id: "sport-create", pattern: /^\/(?:ligues|ententes|clubs|athletes|coachs|arbitres|medecins|officiels|autres-acteurs|competitions|equipe-nationale|licences|transferts)\/(?:nouveau|[^/]+\/modifier)$/, requirement: SPT, action: "WRITE" },
  { id: "sport", pattern: /^\/(?:api\/)?(?:ligues|ententes|clubs|athletes|coachs|arbitres|medecins|officiels|autres-acteurs|competitions|equipe-nationale|suivi-equipe-nationale|licences|transferts|affiliations|actors|avatars|club-logos)(?:\/.*)?$/, requirement: SPT },
  { id: "dashboard", pattern: /^\/$/, requirement: SPT },
]
export function routePolicy(path: string, method = "GET"): RoutePolicy | null {
  const rule = ROUTE_RULES.find(item => item.pattern.test(path))
  if (!rule) return null
  return { ...rule.requirement, action: rule.action || (["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase()) ? "READ" : "WRITE"), id: rule.id }
}
