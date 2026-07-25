import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { CoachsClient } from "@/components/coachs/coachs-client"
import { getClubs, getCoachs, getEntentes, getLigues } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getCoachAffiliations, getCoachLicences } from "@/lib/actor-records"
import { getActorSexes } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CoachsPage() {
  const [coachs, affiliations, licences, sexes, clubs, ententes, ligues] = await Promise.all([
    getCoachs(), getCoachAffiliations(), getCoachLicences(), getActorSexes(),
    getClubs(), getEntentes(), getLigues(),
  ])
  const structures = [
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "Club" })),
    ...ententes.map((item) => ({ key: `entente:${item.idEntente}`, id: item.idEntente, nom: item.nomEntente, type: "Entente" })),
    ...ligues.map((item) => ({ key: `ligue:${item.idLigue}`, id: item.idLigue, nom: item.nomLigue, type: "Ligue" })),
  ].filter((item, index, all) => item.id && item.nom && all.findIndex((candidate) => candidate.key === item.key) === index)

  return (
    <DashboardLayout>
      <Header title="Coachs" subtitle="Gérez les entraîneurs affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <CoachsClient coachs={coachs} affiliations={affiliations} licences={licences} sexes={sexes} structures={structures} />
      </div>
    </DashboardLayout>
  )
}
