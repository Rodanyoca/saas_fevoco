import { Header } from "@/components/dashboard/header"
import { AthleteLicencesClient } from "@/components/licences/athlete-licences-client"
import { athleteLicenceOverview } from "@/lib/licences-overview"
export const dynamic = "force-dynamic"
export default async function LicencesPage() {
  let rows: Awaited<ReturnType<typeof athleteLicenceOverview>> = [], error = ""
  try { rows = await athleteLicenceOverview() } catch (reason) { error = reason instanceof Error ? reason.message : "Source indisponible." }
  const clubs = [...new Map(rows.filter(row => row.clubId).map(row => [row.clubId, { id: row.clubId, label: row.club, ententeId: row.ententeId, entente: row.entente, ligueId: row.ligueId, ligue: row.ligue }])).values()]
  const seasons = [...new Map(rows.map(row => [row.seasonId, { id: row.seasonId, label: row.saison }])).values()]
  return <><Header title="Licences des athlètes" subtitle="Synthèse des licences. La délivrance accompagne les nouveaux rattachements sportifs." /><main className="space-y-6 p-4 sm:p-6"><AthleteLicencesClient rows={rows} error={error} creation={{ clubs, seasons }} /></main></>
}
