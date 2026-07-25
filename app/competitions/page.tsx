import { CompetitionsClient } from "@/components/competitions/competitions-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { getCompetitionClassements, getCompetitionParticipants, getCompetitionResults, getCompetitionUnites, getCompetitions } from "@/lib/data"
import { isCompetitionsGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CompetitionsPage() {
  const loaded = await Promise.allSettled([
    getCompetitions(),
    getCompetitionParticipants(),
    getCompetitionUnites(),
    getCompetitionResults(),
    getCompetitionClassements(),
  ])
  const value = <T,>(index: number): T[] =>
    loaded[index].status === "fulfilled" ? loaded[index].value as T[] : []
  const competitions = value<Awaited<ReturnType<typeof getCompetitions>>[number]>(0)
  const participants = value<Awaited<ReturnType<typeof getCompetitionParticipants>>[number]>(1)
  const unites = value<Awaited<ReturnType<typeof getCompetitionUnites>>[number]>(2)
  const results = value<Awaited<ReturnType<typeof getCompetitionResults>>[number]>(3)
  const classements = value<Awaited<ReturnType<typeof getCompetitionClassements>>[number]>(4)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header
          title="Gestion des Competitions"
          subtitle="Vue liste et details des competitions FEVOCO"
        />
        {!isCompetitionsGoogleSheetsConfigured() && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Le classeur Compétitions n’est pas configuré. Ajoutez
            {" "}<code>FEVOCO_COMPETITIONS_SPREADSHEET_ID</code> dans votre environnement.
          </div>
        )}

        <CompetitionsClient
          competitions={competitions}
          participants={participants}
          unites={unites}
          results={results}
          classements={classements}
        />
      </div>
    </DashboardLayout>
  )
}
