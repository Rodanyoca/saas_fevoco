import { Header } from "@/components/dashboard/header"
import { ActorLicencesClient } from "@/components/licences/actor-licences-client"
import { actorLicencePageData } from "@/lib/actor-licence-creation"
import type { ActorLicenceReferences, ActorLicenceView } from "@/lib/actor-licences-model"
export const dynamic = "force-dynamic"
export default async function EntourageLicencesPage() {
  let rows: ActorLicenceView[] = [], references: ActorLicenceReferences = { types: [], cycles: [], statuses: [], actors: [], affiliations: [] }, error = ""
  try { ({ rows, references } = await actorLicencePageData()) } catch { error = "Les licences sont temporairement indisponibles. Veuillez réessayer." }
  return <><Header title="Licences des acteurs" subtitle="Coachs, officiels, arbitres et médecins" /><main className="space-y-6 p-4 sm:p-6"><ActorLicencesClient rows={rows} references={references} error={error} /></main></>
}
