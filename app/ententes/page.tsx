import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { EntentesStats } from "@/components/ententes/ententes-stats"
import { EntentesFilters } from "@/components/ententes/ententes-filters"
import { EntentesTable } from "@/components/ententes/ententes-table"

export default function EntentesPage() {
  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ententes"
        subtitle="Administration des ententes provinciales de volleyball"
      />

      <div className="p-6 space-y-6">
        {/* Statistiques */}
        <EntentesStats />

        {/* Filtres */}
        <EntentesFilters />

        {/* Tableau des ententes */}
        <EntentesTable />
      </div>
    </DashboardLayout>
  )
}
