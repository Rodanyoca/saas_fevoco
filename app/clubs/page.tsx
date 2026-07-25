import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { getAthletes, getClubs, getEntentes } from "@/lib/data"
import type { Athlete, Club } from "@/lib/types"
import { getClubCategories, getClubVersions } from "@/lib/club-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function belongsToClub(athlete: Pick<Athlete, "clubId" | "clubNom">, club: Club) {
  return Boolean(
    (athlete.clubId && athlete.clubId === club.id) ||
      (athlete.clubNom && athlete.clubNom === club.nom),
  )
}

export default async function ClubsPage() {
  const [clubs, athletes, ententes, categories, versions] = await Promise.all([
    getClubs(), getAthletes(), getEntentes(), getClubCategories(), getClubVersions(),
  ])

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

        <ClubsClient
          clubs={clubsWithCounts}
          athletes={athletes}
          ententes={ententes}
          categories={categories}
          versions={versions}
        />
      </div>
    </DashboardLayout>
  )
}
