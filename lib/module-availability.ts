type UnavailableModule = {
  title: string
  description: string
  icon: "national-team" | "activity" | "document" | "settings"
  paths: readonly string[]
}

// Activation is controlled here, independently of users' existing access rights.
const unavailableModules: readonly UnavailableModule[] = [
  { title: "Équipes nationales", description: "Sélections et suivi des équipes nationales", icon: "national-team", paths: ["/equipe-nationale", "/suivi-equipe-nationale"] },
  { title: "Activités", description: "Gestion des activités fédérales", icon: "activity", paths: ["/activites", "/activities"] },
  { title: "Documents", description: "Gestion documentaire de la FEVOCO", icon: "document", paths: ["/documents"] },
  { title: "Paramètres", description: "Paramètres généraux du système", icon: "settings", paths: ["/parametres"] },
]

export function getUnavailableModule(pathname: string): UnavailableModule | undefined {
  const path = pathname.replace(/^\/api(?=\/)/, "")
  return unavailableModules.find(module => module.paths.some(base => path === base || path.startsWith(`${base}/`)))
}
