"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MedecinsStats } from "@/components/medecins/medecins-stats"
import { MedecinsFilters } from "@/components/medecins/medecins-filters"
import { MedecinsTable } from "@/components/medecins/medecins-table"
import { MedecinDetail } from "@/components/medecins/medecin-detail"
import { type Medecin } from "@/lib/data/demo-data"

export default function MedecinsPage() {
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)

  const handleViewMedecin = (medecin: Medecin) => {
    setSelectedMedecin(medecin)
  }

  const handleBack = () => {
    setSelectedMedecin(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {selectedMedecin ? (
          <MedecinDetail medecin={selectedMedecin} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Médecins</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les médecins affiliés à la FEVOCO
              </p>
            </div>
            
            <MedecinsStats />
            <MedecinsFilters />
            <MedecinsTable onViewMedecin={handleViewMedecin} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
