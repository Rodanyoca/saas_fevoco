import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { MedecinsClient } from "@/components/medecins/medecins-client"
import { getMedecins } from "@/lib/data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function MedecinsPage() {
  const medecins = await getMedecins()

  return (
    <DashboardLayout>
      <Header title="Médecins" subtitle="Gérez les médecins affiliés à la FEVOCO" />
      <div className="p-6">
        <MedecinsClient medecins={medecins} />
      </div>
    </DashboardLayout>
  )
}
