import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { AthletesClient } from "@/components/athletes/athletes-client"
import { getAthletes } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getAthleteAffiliations, getAthleteLicences } from "@/lib/actor-records"
import { getActorSexes } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function AthletesPage() {
  const [athletes, affiliations, licences, sexes] = await Promise.all([
    safeDataLoad(getAthletes, []), safeDataLoad(getAthleteAffiliations, []),
    safeDataLoad(getAthleteLicences, []), safeDataLoad(getActorSexes, []),
  ])

  return (
    <DashboardLayout>
      <Header
        title="Athlètes"
        subtitle="Liste des athlètes affiliés à la FEVOCO"
      />
      <main className="space-y-6 p-4 sm:p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ActorsLoadNotice errors={[athletes.error, affiliations.error, licences.error, sexes.error]} />
        <AthletesClient athletes={athletes.data} affiliations={affiliations.data} licences={licences.data} sexes={sexes.data} />
      </main>
    </DashboardLayout>
  )
}
