import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { getAthletes, getTerritorialHierarchy, getProvinceOptions } from "@/lib/data"
import type { Athlete, Club, Entente, Ligue, Province } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function LiguesPage() {
  const results = await Promise.allSettled([
    getTerritorialHierarchy(),
    getAthletes(),
    getProvinceOptions(),
  ])
  const hierarchy = results[0].status === "fulfilled" ? results[0].value : { ligues: [], ententes: [], clubs: [] }
  const { ligues, ententes, clubs } = hierarchy as { ligues: Ligue[]; ententes: Entente[]; clubs: Club[] }
  const athletes = results[1].status === "fulfilled" ? results[1].value as Athlete[] : []
  const provinces = results[2].status === "fulfilled" ? results[2].value as Province[] : []

  const relationsReady = results.slice(0, 2).every((result) => result.status === "fulfilled")
  return (
    <DashboardLayout>
      <LiguesClient
        ligues={ligues}
        ententes={ententes}
        clubs={clubs}
        athletes={athletes}
        provinceOptions={provinces}
        relationsReady={relationsReady}
      />
    </DashboardLayout>
  )
}
