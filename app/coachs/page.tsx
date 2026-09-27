import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { CoachsClient } from "@/components/coachs/coachs-client"
import { getClubs, getCoachs, getEquipeNationale } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getCoachAffiliations, getCoachLicences } from "@/lib/actor-records"
import { getActorAffiliationTypes, getActorSexes, getCoachFunctions, getCoachLevels } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CoachsPage() {
  const [coachs, affiliations, licences, sexes, clubs, equipes, affiliationTypes, coachFunctions, coachLevels] = await Promise.all([
    safeDataLoad(getCoachs, []), safeDataLoad(getCoachAffiliations, []), safeDataLoad(getCoachLicences, []), safeDataLoad(getActorSexes, []),
    safeDataLoad(getClubs, []), safeDataLoad(getEquipeNationale, []), safeDataLoad(getActorAffiliationTypes, []), safeDataLoad(getCoachFunctions, []),
    safeDataLoad(getCoachLevels, []),
  ])
  const structures = [
    ...clubs.data.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "Club" })),
    ...equipes.data.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale, type: "Equipe nationale" })),
  ].filter((item, index, all) => item.id && item.nom && all.findIndex((candidate) => candidate.key === item.key) === index)

  return (
    <DashboardLayout>
      <Header title="Coachs" subtitle="Gérez les entraîneurs affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ActorsLoadNotice errors={[coachs.error, affiliations.error, licences.error, sexes.error, clubs.error, equipes.error, affiliationTypes.error, coachFunctions.error, coachLevels.error]} />
        <CoachsClient coachs={coachs.data} affiliations={affiliations.data} licences={licences.data} sexes={sexes.data} levels={coachLevels.data} structures={structures} affiliationTypes={affiliationTypes.data} coachFunctions={coachFunctions.data} />
      </div>
    </DashboardLayout>
  )
}
