import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { getClubs, getEntentes } from "@/lib/data"
import type { Club, Entente } from "@/lib/types"
import { loadClubActors } from "@/lib/club-actors"
import type { ClubActorsBundle } from "@/lib/club-actors-model"
import { getClubCategories, getClubSexes } from "@/lib/club-references"
import type { ClubReferenceOption } from "@/lib/club-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ClubsPage() {
  const loaded = await Promise.allSettled([
    getClubs(), loadClubActors(), getEntentes(), getClubCategories(), getClubSexes(),
  ])
  const [clubs, actorData, ententes, categories, sexes] = loaded.map((result) => result.status === "fulfilled" ? result.value : undefined) as [Club[] | undefined, ClubActorsBundle | undefined, Entente[] | undefined, ClubReferenceOption[] | undefined, ClubReferenceOption[] | undefined]

  return (
    <DashboardLayout>
      <ClubsClient clubs={clubs || []} actorData={actorData || { byClub: {}, available: false, ignoredRelations: 0 }} ententes={ententes || []} categories={categories || []} sexes={sexes || []} dataLoadError={loaded.some((result) => result.status === "rejected")} />
    </DashboardLayout>
  )
}
