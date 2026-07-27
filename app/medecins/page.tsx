import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { MedecinsClient } from "@/components/medecins/medecins-client"
import { getClubs, getEquipeNationale, getMedecins } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getMedecinAffiliations, getMedecinLicences } from "@/lib/actor-records"
import { getActorAffiliationTypes, getActorSexes, getMedecinSpecialties } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function MedecinsPage() {
  const [medecins, affiliations, licences, sexes, clubs, equipes, affiliationTypes, specialties] = await Promise.all([
    getMedecins(), getMedecinAffiliations(), getMedecinLicences(), getActorSexes(),
    getClubs(), getEquipeNationale(), getActorAffiliationTypes(), getMedecinSpecialties(),
  ])
  const structures = [
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "Club" })),
    ...equipes.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale, type: "Equipe nationale" })),
  ].filter((item, index, all) => item.id && item.nom && all.findIndex((candidate) => candidate.key === item.key) === index)

  return (
    <DashboardLayout>
      <Header title="Médecins" subtitle="Gérez les médecins affiliés à la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <MedecinsClient medecins={medecins} affiliations={affiliations} licences={licences} sexes={sexes} structures={structures} affiliationTypes={affiliationTypes} specialties={specialties} />
      </div>
    </DashboardLayout>
  )
}
