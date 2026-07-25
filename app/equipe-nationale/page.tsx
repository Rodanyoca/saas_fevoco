import { EquipeNationaleClient } from "@/components/equipe-nationale/equipe-nationale-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { getEquipeNationale, getEquipeNationaleCompetitions, getEquipeNationaleResultats, getEquipeNationaleSelections, getEquipeNationaleStaff } from "@/lib/data"
import { isEquipeNationaleGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function EquipeNationalePage() {
  const loaded = await Promise.allSettled([
    getEquipeNationale(),
    getEquipeNationaleSelections(),
    getEquipeNationaleStaff(),
    getEquipeNationaleCompetitions(),
    getEquipeNationaleResultats(),
  ])
  const value = <T,>(index: number): T[] => loaded[index].status === "fulfilled" ? loaded[index].value as T[] : []
  const equipes = value<Awaited<ReturnType<typeof getEquipeNationale>>[number]>(0)
  const selections = value<Awaited<ReturnType<typeof getEquipeNationaleSelections>>[number]>(1)
  const staff = value<Awaited<ReturnType<typeof getEquipeNationaleStaff>>[number]>(2)
  const competitions = value<Awaited<ReturnType<typeof getEquipeNationaleCompetitions>>[number]>(3)
  const resultats = value<Awaited<ReturnType<typeof getEquipeNationaleResultats>>[number]>(4)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Leopards RDC" subtitle="Equipes nationales et membres selectionnes" />
        {!isEquipeNationaleGoogleSheetsConfigured() && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Ajoutez <code>FEVOCO_EQUIPE_NATIONALE_SPREADSHEET_ID</code> dans votre environnement.
          </div>
        )}
        <EquipeNationaleClient equipes={equipes} selections={selections} staff={staff} competitions={competitions} resultats={resultats} />
      </div>
    </DashboardLayout>
  )
}
