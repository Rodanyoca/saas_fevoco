import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EntentesClient } from "@/components/ententes/ententes-client"
import { getAthletes, getTerritorialHierarchy } from "@/lib/data"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function EntentesPage() {
  const loaded = await Promise.allSettled([
    getTerritorialHierarchy(),
    getAthletes(),
  ])
  const hierarchy = loaded[0].status === "fulfilled" ? loaded[0].value : { ententes: [], clubs: [], ligues: [] }
  const { ententes, clubs, ligues } = hierarchy as { ententes: Entente[]; clubs: Club[]; ligues: Ligue[] }
  const athletes = loaded[1].status === "fulfilled" ? loaded[1].value as Athlete[] : []

  return (
    <DashboardLayout>
      <EntentesClient ententes={ententes} ligues={ligues} clubs={clubs} athletes={athletes} dataLoadError={loaded.some((result) => result.status === "rejected")} />
    </DashboardLayout>
  )
}
