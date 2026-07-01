import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { TransfertsClient } from "@/components/transferts/transferts-client"
import { getTransferts } from "@/lib/data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function TransfertsPage() {
  const transferts = await getTransferts()

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header
          title="Gestion des Transferts"
          subtitle="Suivi des transferts des athletes entre clubs FEVOCO"
        />

        <TransfertsClient transferts={transferts} />
      </div>
    </DashboardLayout>
  )
}
