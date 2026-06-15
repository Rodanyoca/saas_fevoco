"use client"

import { useState } from "react"
import type { Arbitre } from "@/lib/types"
import { ArbitresStats } from "@/components/arbitres/arbitres-stats"
import { ArbitresFilters } from "@/components/arbitres/arbitres-filters"
import { ArbitresTable } from "@/components/arbitres/arbitres-table"
import { ArbitreDetail } from "@/components/arbitres/arbitre-detail"

export function ArbitresClient({ arbitres }: { arbitres: Arbitre[] }) {
  const [selectedArbitre, setSelectedArbitre] = useState<Arbitre | null>(null)

  const handleViewArbitre = (arbitre: Arbitre) => {
    setSelectedArbitre(arbitre)
  }

  const handleBack = () => {
    setSelectedArbitre(null)
  }

  return (
    <div className="space-y-6">
      {selectedArbitre ? (
        <ArbitreDetail arbitre={selectedArbitre} onBack={handleBack} />
      ) : (
        <>
          <ArbitresStats arbitres={arbitres} />
          <ArbitresFilters arbitres={arbitres} />
          <ArbitresTable arbitres={arbitres} onViewArbitre={handleViewArbitre} />
        </>
      )}
    </div>
  )
}
