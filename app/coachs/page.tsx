import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { CoachsClient } from "@/components/coachs/coachs-client"
import { getCoachs } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getCoachLicences } from "@/lib/actor-records"
import { getActorSexes, getCoachLevels } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CoachsPage() {
  const [coachs, licences, sexes, coachLevels] = await Promise.all([
    safeDataLoad(getCoachs, []), safeDataLoad(getCoachLicences, []), safeDataLoad(getActorSexes, []),
    safeDataLoad(getCoachLevels, []),
  ])

  return (
    <DashboardLayout>
      <Header title="Coachs" subtitle="Gérez les entraîneurs affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ActorsLoadNotice errors={[coachs.error, licences.error, sexes.error, coachLevels.error]} />
        <CoachsClient coachs={coachs.data} licences={licences.data} sexes={sexes.data} levels={coachLevels.data} />
      </div>
    </DashboardLayout>
  )
}
