import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { TransfertsClient } from "@/components/transferts/transferts-client"
import { getAthletes, getClubs, getTransferts } from "@/lib/data"
import { getTransferTypes } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function TransfertsPage() {
  const [transferts, athletes, clubs, transferTypes] = await Promise.all([
    getTransferts(), getAthletes(), getClubs(), getTransferTypes(),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header
          title="Gestion des Transferts"
          subtitle="Suivi des transferts des athletes entre clubs FEVOCO"
        />

        <TransfertsClient transferts={transferts} athletes={athletes} clubs={clubs} transferTypes={transferTypes} />
      </div>
    </DashboardLayout>
  )
}
