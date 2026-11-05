import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { getTerritorialHierarchy } from "@/lib/data"
import type { Club, Entente } from "@/lib/types"
import { getClubCategories, getClubSexes } from "@/lib/club-references"
import type { ClubReferenceOption } from "@/lib/club-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ClubsPage() {
  const loaded = await Promise.allSettled([
    getTerritorialHierarchy(), getClubCategories(), getClubSexes(),
  ])
  const [hierarchy, categories, sexes] = loaded.map((result) => result.status === "fulfilled" ? result.value : undefined) as [{ clubs: Club[]; ententes: Entente[] } | undefined, ClubReferenceOption[] | undefined, ClubReferenceOption[] | undefined]

  return (
    <DashboardLayout>
      <ClubsClient clubs={hierarchy?.clubs || []} ententes={hierarchy?.ententes || []} categories={categories || []} sexes={sexes || []} dataLoadError={loaded.some((result) => result.status === "rejected")} />
    </DashboardLayout>
  )
}
