import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { OfficielsClient } from "@/components/officiels/officiels-client"
import { getClubs, getEntentes, getEquipeNationale, getLigues, getOfficiels } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getOfficielAffiliations, getOfficielLicences } from "@/lib/actor-records"
import { getActorSexes, getOfficialFunctions } from "@/lib/actor-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function OfficielsPage() {
  const [officiels, affiliations, licences, sexes, ligues, ententes, clubs, equipes, functions] = await Promise.all([
    getOfficiels(), getOfficielAffiliations(), getOfficielLicences(), getActorSexes(),
    getLigues(), getEntentes(), getClubs(), getEquipeNationale(), getOfficialFunctions(),
  ])
  const structures = [
    ...ligues.map((item) => ({ key: `ligue:${item.idLigue}`, id: item.idLigue, nom: item.nomLigue, type: "LIGUE" as const })),
    ...ententes.map((item) => ({ key: `entente:${item.idEntente}`, id: item.idEntente, nom: item.nomEntente, type: "ENTENTE" as const })),
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "CLUB" as const })),
    ...equipes.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale, type: "EQUIPE" as const })),
  ].filter((item, index, all) => item.id && item.nom && all.findIndex((candidate) => candidate.key === item.key) === index)

  return (
    <DashboardLayout>
      <Header title="Officiels" subtitle="Gérez les officiels administratifs de la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <OfficielsClient officiels={officiels} affiliations={affiliations} licences={licences} sexes={sexes} structures={structures} functions={functions} />
      </div>
    </DashboardLayout>
  )
}
