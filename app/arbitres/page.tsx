import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ArbitresClient } from "@/components/arbitres/arbitres-client"
import { getArbitres } from "@/lib/data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ArbitresPage() {
  const arbitres = await getArbitres()

  return (
    <DashboardLayout>
      <Header title="Arbitres" subtitle="Gérez les arbitres officiels de la FEVOCO" />
      <div className="p-6">
        <ArbitresClient arbitres={arbitres} />
      </div>
    </DashboardLayout>
  )
}
