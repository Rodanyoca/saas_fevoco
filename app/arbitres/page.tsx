import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ArbitresClient } from "@/components/arbitres/arbitres-client"
import { getArbitres } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getArbitreLicences } from "@/lib/actor-records"
import { getActorSexes } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ArbitresPage() {
  const [arbitres, licences, sexes] = await Promise.all([getArbitres(), getArbitreLicences(), getActorSexes()])

  return (
    <DashboardLayout>
      <Header title="Arbitres" subtitle="Gérez les arbitres officiels de la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ArbitresClient arbitres={arbitres} licences={licences} sexes={sexes} />
      </div>
    </DashboardLayout>
  )
}
