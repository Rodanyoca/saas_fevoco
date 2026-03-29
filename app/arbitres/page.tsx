"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ArbitresStats } from "@/components/arbitres/arbitres-stats"
import { ArbitresFilters } from "@/components/arbitres/arbitres-filters"
import { ArbitresTable } from "@/components/arbitres/arbitres-table"
import { ArbitreDetail } from "@/components/arbitres/arbitre-detail"
import { type Arbitre } from "@/lib/data/demo-data"

export default function ArbitresPage() {
  const [selectedArbitre, setSelectedArbitre] = useState<Arbitre | null>(null)

  const handleViewArbitre = (arbitre: Arbitre) => {
    setSelectedArbitre(arbitre)
  }

  const handleBack = () => {
    setSelectedArbitre(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {selectedArbitre ? (
          <ArbitreDetail arbitre={selectedArbitre} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Arbitres</h1>
              <p className="text-muted-foreground mt-1">
                Gerez les arbitres officiels de la FEVOCO
              </p>
            </div>
            
            <ArbitresStats />
            <ArbitresFilters />
            <ArbitresTable onViewArbitre={handleViewArbitre} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
