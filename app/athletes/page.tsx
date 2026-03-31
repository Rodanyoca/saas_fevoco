"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AthletesStats } from "@/components/athletes/athletes-stats"
import { AthletesFilters } from "@/components/athletes/athletes-filters"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { AthleteDetail } from "@/components/athletes/athlete-detail"
import { type Athlete } from "@/lib/data/demo-data"

export default function AthletesPage() {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)

  const handleViewAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete)
  }

  const handleBack = () => {
    setSelectedAthlete(null)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {selectedAthlete ? (
          <AthleteDetail athlete={selectedAthlete} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Athlètes</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les athlètes inscrits à la FEVOCO
              </p>
            </div>

            <AthletesStats />
            <AthletesFilters />
            <AthletesTable onViewAthlete={handleViewAthlete} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
