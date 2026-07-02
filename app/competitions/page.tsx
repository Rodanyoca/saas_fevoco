import { CompetitionsClient } from "@/components/competitions/competitions-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { getCompetitionClassements, getCompetitionParticipants, getCompetitionResults, getCompetitionUnites, getCompetitions } from "@/lib/data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function safeLoad<T>(loader: () => Promise<T[]>, timeoutMs = 12_000): Promise<T[]> {
  try {
    let timeoutId: NodeJS.Timeout | undefined
    const timeout = new Promise<T[]>((resolve) => {
      timeoutId = setTimeout(() => resolve([]), timeoutMs)
    })
    const result = await Promise.race([loader(), timeout])
    if (timeoutId) clearTimeout(timeoutId)
    return result
  } catch {
    return []
  }
}

export default async function CompetitionsPage() {
  const [competitions, participants, unites, results, classements] = await Promise.all([
    safeLoad(getCompetitions),
    safeLoad(getCompetitionParticipants),
    safeLoad(getCompetitionUnites),
    safeLoad(getCompetitionResults),
    safeLoad(getCompetitionClassements),
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
          classements={classements}
        />
      </div>
    </DashboardLayout>
  )
}
