import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { OfficielsClient } from "@/components/officiels/officiels-client"
import { getOfficiels } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getOfficielAffiliations, getOfficielLicences } from "@/lib/actor-records"
import { getActorSexes } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function OfficielsPage() {
  const [officiels, affiliations, licences, sexes] = await Promise.all([getOfficiels(), getOfficielAffiliations(), getOfficielLicences(), getActorSexes()])

  return (
    <DashboardLayout>
      <Header title="Officiels" subtitle="Gérez les officiels administratifs de la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <OfficielsClient officiels={officiels} affiliations={affiliations} licences={licences} sexes={sexes} />
      </div>
    </DashboardLayout>
  )
}
