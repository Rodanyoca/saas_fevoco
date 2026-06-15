import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ProvincesClient } from "@/components/provinces/provinces-client"
import { getClubs, getEntentes, getLigues, getProvinces } from "@/lib/data"

export const runtime = "nodejs"

export default async function ProvincesPage() {
  const [provinces, ligues, ententes, clubs] = await Promise.all([
    getProvinces(),
    getLigues(),
    getEntentes(),
    getClubs(),
  ])

  return (
    <DashboardLayout>
      <Header title="Provinces" subtitle="Gérez les provinces affiliées à la FEVOCO" />
      <div className="p-6">
        <ProvincesClient provinces={provinces} ligues={ligues} ententes={ententes} clubs={clubs} />
      </div>
    </DashboardLayout>
  )
}
