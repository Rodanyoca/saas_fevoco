"use client"

import { useState } from "react"
import type { Athlete } from "@/lib/types"
import { AthletesStats } from "@/components/athletes/athletes-stats"
import { AthletesFilters } from "@/components/athletes/athletes-filters"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { AthleteDetail } from "@/components/athletes/athlete-detail"

export function AthletesClient({ athletes }: { athletes: Athlete[] }) {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)

  const handleViewAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete)
  }

  const handleBack = () => {
    setSelectedAthlete(null)
  }

  return (
    <div className="space-y-6">
      {selectedAthlete ? (
        <AthleteDetail athlete={selectedAthlete} onBack={handleBack} />
      ) : (
        <>
          <AthletesStats athletes={athletes} />
          <AthletesFilters athletes={athletes} />
          <AthletesTable athletes={athletes} onViewAthlete={handleViewAthlete} />
        </>
      )}
    </div>
  )
}
