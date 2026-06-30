import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { getAthletes, getClubs } from "@/lib/data"
import type { Athlete, Club } from "@/lib/types"

export const runtime = "nodejs"

function belongsToClub(athlete: Pick<Athlete, "clubId" | "clubNom">, club: Club) {
  return Boolean(
    (athlete.clubId && athlete.clubId === club.id) ||
      (athlete.clubNom && athlete.clubNom === club.nom),
  )
}

export default async function ClubsPage() {
  const [clubs, athletes] = await Promise.all([getClubs(), getAthletes()])

  const clubsWithCounts = clubs.map((club) => ({
    ...club,
    athletes: athletes.filter((athlete) => belongsToClub(athlete, club)).length,
  }))

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Header
          title="Gestion des Clubs"
          subtitle="Gérez les clubs affiliés à la FEVOCO"
        />

        <ClubsClient clubs={clubsWithCounts} athletes={athletes} />
      </div>
    </DashboardLayout>
  )
}
