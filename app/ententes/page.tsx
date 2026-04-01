import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { EntentesStats } from "@/components/ententes/ententes-stats"
import { EntentesClient } from "@/components/ententes/ententes-client"

import { getEntentes } from "@/lib/data"

export const runtime = "nodejs"

export default async function EntentesPage() {
  const ententes = await getEntentes()

  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ententes"
        subtitle="Administration des ententes provinciales de volleyball"
      />

      <div className="p-6 space-y-6">
        {/* Statistiques */}
        <EntentesStats ententes={ententes} />

        <EntentesClient ententes={ententes} />
      </div>
    </DashboardLayout>
  )
}
