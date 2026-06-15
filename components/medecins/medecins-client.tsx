"use client"

import { useState } from "react"
import type { Medecin } from "@/lib/types"
import { MedecinsStats } from "@/components/medecins/medecins-stats"
import { MedecinsFilters } from "@/components/medecins/medecins-filters"
import { MedecinsTable } from "@/components/medecins/medecins-table"
import { MedecinDetail } from "@/components/medecins/medecin-detail"

export function MedecinsClient({ medecins }: { medecins: Medecin[] }) {
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)

  const handleViewMedecin = (medecin: Medecin) => {
    setSelectedMedecin(medecin)
  }

  const handleBack = () => {
    setSelectedMedecin(null)
  }

  return (
    <div className="space-y-6">
      {selectedMedecin ? (
        <MedecinDetail medecin={selectedMedecin} onBack={handleBack} />
      ) : (
        <>
          <MedecinsStats medecins={medecins} />
          <MedecinsFilters medecins={medecins} />
          <MedecinsTable medecins={medecins} onViewMedecin={handleViewMedecin} />
        </>
      )}
    </div>
  )
}
