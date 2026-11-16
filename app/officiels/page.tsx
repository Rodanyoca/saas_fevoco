import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { OfficielsClient } from "@/components/officiels/officiels-client"
import { getTerritorialHierarchy, getOfficiels } from "@/lib/data"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getOfficielAffiliations, getOfficielLicences } from "@/lib/actor-records"
import { getActorSexes, getOfficialFunctions, getSeasons, getStructureTypes } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { firstIndex } from "@/lib/first-index"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function OfficielsPage() {
  const [officiels, affiliations, licences, sexes, territory, functions, structureTypes, seasons] = await Promise.all([
    safeDataLoad(getOfficiels, []), safeDataLoad(getOfficielAffiliations, []), safeDataLoad(getOfficielLicences, []), safeDataLoad(getActorSexes, []),
    safeDataLoad(getTerritorialHierarchy, { ligues: [], ententes: [], clubs: [], provinces: [] }), safeDataLoad(getOfficialFunctions, []), safeDataLoad(getStructureTypes, []), safeDataLoad(getSeasons, []),
  ])
  const structures = [...firstIndex([
    ...territory.data.ligues.map((item) => ({ key: `ligue:${item.idLigue}`, id: item.idLigue, nom: item.nomLigue, type: "LIGUE" as const })),
    ...territory.data.ententes.map((item) => ({ key: `entente:${item.idEntente}`, id: item.idEntente, nom: item.nomEntente, type: "ENTENTE" as const })),
    ...territory.data.clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "CLUB" as const })),
  ], item => item.key).values()].filter(item => item.id && item.nom)
  const functionNames = new Map(functions.data.map((item) => [item.id, item.nom]))
  const structureTypeNames = new Map(structureTypes.data.map((item) => [item.id, item.nom]))
  const seasonNames = new Map(seasons.data.map((item) => [item.id, item.nom]))
  const structureNames = new Map(structures.map((item) => [item.id, item.nom]))
  const mandates = affiliations.data.map((item) => ({
    ...item,
    fonction: functionNames.get(item.idFonction) ?? item.fonction,
    typeStructure: structureTypeNames.get(item.idTypeStructure) ?? item.typeStructure,
    saison: seasonNames.get(item.idSaison) ?? item.saison,
    nomStructure: structureNames.get(item.idStructure) ?? item.nomStructure,
  }))

  return (
    <DashboardLayout>
      <Header title="Officiels" subtitle="Gérez les officiels administratifs de la FEVOCO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ActorsLoadNotice errors={[officiels.error, affiliations.error, licences.error, sexes.error, territory.error, functions.error, structureTypes.error, seasons.error]} />
        <OfficielsClient officiels={officiels.data} affiliations={mandates} licences={licences.data} sexes={sexes.data} structures={structures} functions={functions.data} structureTypes={structureTypes.data} seasons={seasons.data} />
      </div>
    </DashboardLayout>
  )
}
