import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { MedecinsClient } from "@/components/medecins/medecins-client"
import { getClubs, getEquipeNationale, getMedecins } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getMedecinAffiliations, getMedecinLicences } from "@/lib/actor-records"
import { getActorAffiliationTypes, getActorSexes, getMedecinSpecialties } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function MedecinsPage() {
  const [medecins, affiliations, licences, sexes, clubs, equipes, affiliationTypes, specialties] = await Promise.all([
    safeDataLoad(getMedecins, []), safeDataLoad(getMedecinAffiliations, []), safeDataLoad(getMedecinLicences, []), safeDataLoad(getActorSexes, []),
    safeDataLoad(getClubs, []), safeDataLoad(getEquipeNationale, []), safeDataLoad(getActorAffiliationTypes, []), safeDataLoad(getMedecinSpecialties, []),
  ])
  const structures = [
    ...clubs.data.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "Club" })),
    ...equipes.data.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale, type: "Equipe nationale" })),
  ].filter((item, index, all) => item.id && item.nom && all.findIndex((candidate) => candidate.key === item.key) === index)

  return (
    <DashboardLayout>
      <Header title="Médecins" subtitle="Gérez les médecins affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ActorsLoadNotice errors={[medecins.error, affiliations.error, licences.error, sexes.error, clubs.error, equipes.error, affiliationTypes.error, specialties.error]} />
        <MedecinsClient medecins={medecins.data} affiliations={affiliations.data} licences={licences.data} sexes={sexes.data} structures={structures} affiliationTypes={affiliationTypes.data} specialties={specialties.data} />
      </div>
    </DashboardLayout>
  )
}
