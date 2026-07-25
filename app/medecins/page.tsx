import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { MedecinsClient } from "@/components/medecins/medecins-client"
import { getMedecins } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getMedecinAffiliations, getMedecinLicences } from "@/lib/actor-records"
import { getActorSexes } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function MedecinsPage() {
  const [medecins, affiliations, licences, sexes] = await Promise.all([getMedecins(), getMedecinAffiliations(), getMedecinLicences(), getActorSexes()])

  return (
    <DashboardLayout>
      <Header title="Médecins" subtitle="Gérez les médecins affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <MedecinsClient medecins={medecins} affiliations={affiliations} licences={licences} sexes={sexes} />
      </div>
    </DashboardLayout>
  )
}
