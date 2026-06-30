import { CompetitionsClient } from "@/components/competitions/competitions-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { getCompetitionParticipants, getCompetitionResults, getCompetitionUnites, getCompetitions } from "@/lib/data"

export const runtime = "nodejs"

export default async function CompetitionsPage() {
  const [competitions, participants, unites, results] = await Promise.all([
    getCompetitions(),
    getCompetitionParticipants(),
    getCompetitionUnites(),
    getCompetitionResults(),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header
          title="Gestion des Competitions"
          subtitle="Vue liste et details des competitions FEVOCO"
        />

        <CompetitionsClient
          competitions={competitions}
          participants={participants}
          unites={unites}
          results={results}
        />
      </div>
    </DashboardLayout>
  )
}
