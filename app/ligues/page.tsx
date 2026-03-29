import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { LiguesTable } from "@/components/ligues/ligues-table"
import { LiguesStats } from "@/components/ligues/ligues-stats"
import { LiguesFilters } from "@/components/ligues/ligues-filters"

export default function LiguesPage() {
  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ligues"
        subtitle="Liste et administration des ligues provinciales"
      />

      <div className="p-6 space-y-6">
        {/* Statistiques des ligues */}
        <LiguesStats />

        {/* Filtres et actions */}
        <LiguesFilters />

        {/* Tableau des ligues */}
        <LiguesTable />
      </div>
    </DashboardLayout>
  )
}
