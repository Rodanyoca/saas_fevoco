import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { OfficielsClient } from "@/components/officiels/officiels-client"
import { getOfficiels } from "@/lib/data"

export const runtime = "nodejs"

export default async function OfficielsPage() {
  const officiels = await getOfficiels()

  return (
    <DashboardLayout>
      <Header title="Officiels" subtitle="Gérez les officiels administratifs de la FEVOCO" />
      <div className="p-6">
        <OfficielsClient officiels={officiels} />
      </div>
    </DashboardLayout>
  )
}
