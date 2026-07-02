import { EquipeNationaleClient } from "@/components/equipe-nationale/equipe-nationale-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { getEquipeNationale, getEquipeNationaleSelections } from "@/lib/data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function EquipeNationalePage() {
  const [equipes, selections] = await Promise.all([
    getEquipeNationale(),
    getEquipeNationaleSelections(),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Leopards RDC" subtitle="Equipes nationales et membres selectionnes" />
        <EquipeNationaleClient equipes={equipes} selections={selections} />
      </div>
    </DashboardLayout>
  )
}
