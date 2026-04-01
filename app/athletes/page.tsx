import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { AthletesClient } from "@/components/athletes/athletes-client"
import { getAthletes } from "@/lib/data"

export const runtime = "nodejs"

export default async function AthletesPage() {
  const athletes = await getAthletes()

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Header
          title="Gestion des Athlètes"
          subtitle="Gérez les athlètes inscrits à la FEVOCO"
        />

        <AthletesClient athletes={athletes} />
      </div>
    </DashboardLayout>
  )
}
