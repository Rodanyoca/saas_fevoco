import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { CoachsClient } from "@/components/coachs/coachs-client"
import { getClubs, getCoachs, getEquipeNationale } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getCoachAffiliations, getCoachLicences } from "@/lib/actor-records"
import { getActorAffiliationTypes, getActorSexes, getCoachFunctions } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CoachsPage() {
  const [coachs, affiliations, licences, sexes, clubs, equipes, affiliationTypes, coachFunctions] = await Promise.all([
    getCoachs(), getCoachAffiliations(), getCoachLicences(), getActorSexes(),
    getClubs(), getEquipeNationale(), getActorAffiliationTypes(), getCoachFunctions(),
  ])
  const structures = [
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "Club" })),
    ...equipes.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale, type: "Equipe nationale" })),
  ].filter((item, index, all) => item.id && item.nom && all.findIndex((candidate) => candidate.key === item.key) === index)

  return (
    <DashboardLayout>
      <Header title="Coachs" subtitle="Gérez les entraîneurs affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <CoachsClient coachs={coachs} affiliations={affiliations} licences={licences} sexes={sexes} structures={structures} affiliationTypes={affiliationTypes} coachFunctions={coachFunctions} />
      </div>
    </DashboardLayout>
  )
}
