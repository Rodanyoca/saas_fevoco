import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { getAthletes, getClubs, getEntentes, getLigues, getProvinceOptions } from "@/lib/data"
import type { Athlete, Club, Entente, Ligue, Province } from "@/lib/types"
import { buildLigueHierarchy } from "@/lib/territorial-hierarchy"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function LiguesPage() {
  const results = await Promise.allSettled([
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
    getProvinceOptions(),
  ])
  const [ligues, ententes, clubs, athletes, provinces] = results.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  ) as [Ligue[], Entente[], Club[], Athlete[], Province[]]

  const relationsReady = results.slice(1, 4).every((result) => result.status === "fulfilled")
  const liguesWithCounts = ligues.map((ligue) => {
    if (!relationsReady) return ligue
    const hierarchy = buildLigueHierarchy(ligue, ententes, clubs, athletes)
    hierarchy.diagnostics.forEach((message) => console.warn(`[Ligues] ${message}`))
    return { ...ligue, ententes: hierarchy.ententes.length, clubs: hierarchy.clubs.length, athletes: hierarchy.athletes.length }
  })

  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ligues"
        subtitle="Liste et administration des ligues provinciales"
      />

      <div className="p-6 space-y-6">
        <LiguesClient
          ligues={liguesWithCounts}
          ententes={ententes}
          clubs={clubs}
          athletes={athletes}
          provinceOptions={provinces}
          relationsReady={relationsReady}
        />
      </div>
    </DashboardLayout>
  )
}
