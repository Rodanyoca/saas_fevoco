import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { LiguesStats } from "@/components/ligues/ligues-stats"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { getLigues } from "@/lib/data"

export const runtime = "nodejs"

export default async function LiguesPage() {
  const ligues = await getLigues()

  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ligues"
        subtitle="Liste et administration des ligues provinciales"
      />

      <div className="p-6 space-y-6">
        {/* Statistiques des ligues */}
        <LiguesStats ligues={ligues} />

        <LiguesClient ligues={ligues} />
      </div>
    </DashboardLayout>
  )
}
