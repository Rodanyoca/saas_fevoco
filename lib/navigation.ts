export type NavigationIcon =
  | "dashboard"
  | "territory"
  | "league"
  | "entente"
  | "club"
  | "actors"
  | "athlete"
  | "coach"
  | "doctor"
  | "referee"
  | "official"
  | "movement"
  | "license"
  | "competition"
  | "national-team"
  | "activity"
  | "document"

export type NavigationItem = {
  name: string
  href?: string
  icon?: NavigationIcon
  disabled?: boolean
  badge?: string
  children?: readonly NavigationItem[]
}

export const dashboardNavigation: readonly NavigationItem[] = [
  { name: "Tableau de bord", href: "/", icon: "dashboard" },
  { name: "Structure territoriale", children: [
    { name: "Ligues", href: "/ligues", icon: "league" },
    { name: "Ententes", href: "/ententes", icon: "entente" },
    { name: "Clubs", href: "/clubs", icon: "club" },
  ] },
  { name: "Acteurs", children: [
    { name: "Athlètes", href: "/athletes", icon: "athlete" },
    { name: "Entraîneurs", href: "/coachs", icon: "coach" },
    { name: "Arbitres", href: "/arbitres", icon: "referee" },
    { name: "Médecins", href: "/medecins", icon: "doctor" },
    { name: "Officiels", href: "/officiels", icon: "official" },
  ] },
  { name: "Licences", children: [
    { name: "Athlètes", icon: "license", disabled: true, badge: "Bientôt" },
    { name: "Entourage", icon: "coach", disabled: true, badge: "Bientôt" },
  ] },
  { name: "Compétitions", children: [
    { name: "Compétitions", href: "/competitions", icon: "competition" },
  ] },
  { name: "Équipes nationales", children: [
    { name: "Équipes nationales", href: "/equipe-nationale", icon: "national-team" },
  ] },
  { name: "Activités", href: "/activites", icon: "activity" },
  { name: "Documents", href: "/documents", icon: "document" },
] as const

export function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
  if (item.children?.some((child) => isNavigationItemActive(child, pathname))) return true
  if (!item.href) return false
  if (item.href === "/") return pathname === "/"
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
