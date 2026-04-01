import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { getClubs } from "@/lib/data"

export const runtime = "nodejs"

export default async function ClubsPage() {
  const clubs = await getClubs()

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Header
          title="Gestion des Clubs"
          subtitle="Gérez les clubs affiliés à la FEVOCO"
        />

        <ClubsClient clubs={clubs} />
      </div>
    </DashboardLayout>
  )
}
