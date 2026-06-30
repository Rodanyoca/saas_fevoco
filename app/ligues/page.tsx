import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { getAthletes, getClubs, getEntentes, getLigues } from "@/lib/data"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"

export const runtime = "nodejs"

function belongsToLigue(
  item: Pick<Entente | Club | Athlete, "ligueId" | "ligueNom">,
  ligue: Ligue,
) {
  return Boolean(
    (item.ligueId && item.ligueId === ligue.id) ||
      (item.ligueNom && item.ligueNom === ligue.nom),
  )
}

export default async function LiguesPage() {
  const [ligues, ententes, clubs, athletes] = await Promise.all([
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
  ])

  const liguesWithCounts = ligues.map((ligue) => ({
    ...ligue,
    ententes: ententes.filter((entente) => belongsToLigue(entente, ligue)).length,
    clubs: clubs.filter((club) => belongsToLigue(club, ligue)).length,
    athletes: athletes.filter((athlete) => belongsToLigue(athlete, ligue)).length,
  }))

  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ligues"
        subtitle="Liste et administration des ligues provinciales"
      />

      <div className="p-6 space-y-6">
        <LiguesClient
          ligues={liguesWithCounts}
          ententes={ententes}
          clubs={clubs}
          athletes={athletes}
        />
      </div>
    </DashboardLayout>
  )
}
