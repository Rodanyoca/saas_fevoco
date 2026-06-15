"use client"

import { useState } from "react"
import type { Coach } from "@/lib/types"
import { CoachsStats } from "@/components/coachs/coachs-stats"
import { CoachsFilters } from "@/components/coachs/coachs-filters"
import { CoachsTable } from "@/components/coachs/coachs-table"
import { CoachDetail } from "@/components/coachs/coach-detail"

export function CoachsClient({ coachs }: { coachs: Coach[] }) {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)

  const handleViewCoach = (coach: Coach) => {
    setSelectedCoach(coach)
  }

  const handleBack = () => {
    setSelectedCoach(null)
  }

  return (
    <div className="space-y-6">
      {selectedCoach ? (
        <CoachDetail coach={selectedCoach} onBack={handleBack} />
      ) : (
        <>
          <CoachsStats coachs={coachs} />
          <CoachsFilters coachs={coachs} />
          <CoachsTable coachs={coachs} onViewCoach={handleViewCoach} />
        </>
      )}
    </div>
  )
}
