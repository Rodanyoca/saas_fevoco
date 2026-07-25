import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { AthletesClient } from "@/components/athletes/athletes-client"
import { getAthletes } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getAthleteAffiliations, getAthleteLicences } from "@/lib/actor-records"
import { getActorSexes } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function AthletesPage() {
  const [athletes, affiliations, licences, sexes] = await Promise.all([
    getAthletes(), getAthleteAffiliations(), getAthleteLicences(), getActorSexes(),
  ])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Header
          title="Gestion des Athlètes"
          subtitle="Gérez les athlètes inscrits à la FEVOCO"
        />
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}

        <AthletesClient athletes={athletes} affiliations={affiliations} licences={licences} sexes={sexes} />
      </div>
    </DashboardLayout>
  )
}
