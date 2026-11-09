import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { TransfertsClient } from "@/components/transferts/transferts-client"
import { getAthletes, getTransferts } from "@/lib/data"

import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function TransfertsPage() {
  const [transferts, athletes] = await Promise.all([
    safeDataLoad(getTransferts, []), safeDataLoad(getAthletes, []),

  ])

  return (
    <DashboardLayout>
      <Header title="Transferts" subtitle="Affiliations et transferts des athlètes entre clubs FEVOCO" />
      <main className="space-y-6 p-4 sm:p-6">
        <ActorsLoadNotice errors={[transferts.error, athletes.error]} />
        <TransfertsClient transferts={transferts.data} athletes={athletes.data} />
      </main>
    </DashboardLayout>
  )
}
