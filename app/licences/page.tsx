import { Header } from "@/components/dashboard/header"
import { AthleteLicencesClient } from "@/components/licences/athlete-licences-client"
import { athleteLicenceOverview } from "@/lib/licences-overview"
export const dynamic = "force-dynamic"
export default async function LicencesPage() { let rows: Awaited<ReturnType<typeof athleteLicenceOverview>> = [], error = ""; try { rows = await athleteLicenceOverview() } catch (reason) { error = reason instanceof Error ? reason.message : "Données temporairement indisponibles." } return <><Header title="Licences des athlètes" subtitle="Licences enregistrées par saison et par structure territoriale" /><main className="space-y-6 p-4 sm:p-6"><AthleteLicencesClient rows={rows} error={error} /></main></> }
