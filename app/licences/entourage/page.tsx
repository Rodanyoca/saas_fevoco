import { Header } from "@/components/dashboard/header"
import { ActorLicencesClient } from "@/components/licences/actor-licences-client"
import { actorLicenceOverview } from "@/lib/licences-overview"
export const dynamic = "force-dynamic"
export default async function EntourageLicencesPage() { let rows: Awaited<ReturnType<typeof actorLicenceOverview>> = [], error = ""; try { rows = await actorLicenceOverview() } catch (reason) { error = reason instanceof Error ? reason.message : "Données temporairement indisponibles." } return <><Header title="Licences des acteurs" subtitle="Coachs, officiels, arbitres et médecins" /><main className="space-y-6 p-4 sm:p-6"><ActorLicencesClient rows={rows} error={error} /></main></> }
