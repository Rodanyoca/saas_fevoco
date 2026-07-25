import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { EntentesClient } from "@/components/ententes/ententes-client"

import { getAthletes, getClubs, getEntentes, getLigues } from "@/lib/data"
import type { Athlete, Club, Entente } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function belongsToEntente(item: Pick<Club | Athlete, "ententeId" | "ententeNom">, entente: Entente) {
  return Boolean(
    (item.ententeId && item.ententeId === entente.id) ||
      (item.ententeNom && item.ententeNom === entente.nom),
  )
}

export default async function EntentesPage() {
  const [ententes, clubs, athletes, ligues] = await Promise.all([
    getEntentes(),
    getClubs(),
    getAthletes(),
    getLigues(),
  ])

  const ententesWithCounts = ententes.map((entente) => ({
    ...entente,
    clubs: clubs.filter((club) => belongsToEntente(club, entente)).length,
    athletes: athletes.filter((athlete) => belongsToEntente(athlete, entente)).length,
  }))

  return (
    <DashboardLayout>
      <Header
        title="Gestion des Ententes"
        subtitle="Administration des ententes provinciales de volleyball"
      />

      <div className="p-6 space-y-6">
        <EntentesClient ententes={ententesWithCounts} ligues={ligues} />
      </div>
    </DashboardLayout>
  )
}
