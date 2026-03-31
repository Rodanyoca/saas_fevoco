"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CoachsStats } from "@/components/coachs/coachs-stats"
import { CoachsFilters } from "@/components/coachs/coachs-filters"
import { CoachsTable } from "@/components/coachs/coachs-table"
import { CoachDetail } from "@/components/coachs/coach-detail"
import { type Coach } from "@/lib/data/demo-data"

export default function CoachsPage() {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)

  const handleViewCoach = (coach: Coach) => {
    setSelectedCoach(coach)
  }

  const handleBack = () => {
    setSelectedCoach(null)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {selectedCoach ? (
          <CoachDetail coach={selectedCoach} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Coachs</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les entraîneurs affiliés à la FEVOCO
              </p>
            </div>

            <CoachsStats />
            <CoachsFilters />
            <CoachsTable onViewCoach={handleViewCoach} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
