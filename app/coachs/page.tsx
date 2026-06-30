import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { CoachsClient } from "@/components/coachs/coachs-client"
import { getCoachAffiliations, getCoachs } from "@/lib/data"

export const runtime = "nodejs"

export default async function CoachsPage() {
  const [coachs, affiliations] = await Promise.all([
    getCoachs(),
    getCoachAffiliations(),
  ])

  return (
    <DashboardLayout>
      <Header title="Coachs" subtitle="Gérez les entraîneurs affiliés à la FEVOCO" />
      <div className="p-6">
        <CoachsClient coachs={coachs} affiliations={affiliations} />
      </div>
    </DashboardLayout>
  )
}
