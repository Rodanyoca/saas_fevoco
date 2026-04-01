"use client"

import { useMemo, useState } from "react"
import type { Club } from "@/lib/types"
import { ClubsStats } from "@/components/clubs/clubs-stats"
import { ClubsFilters } from "@/components/clubs/clubs-filters"
import { ClubsTable } from "@/components/clubs/clubs-table"
import { ClubDetail } from "@/components/clubs/club-detail"

export function ClubsClient({ clubs }: { clubs: Club[] }) {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  const statsClubs = useMemo(() => clubs, [clubs])

  const handleViewClub = (club: Club) => {
    setSelectedClub(club)
  }

  const handleBack = () => {
    setSelectedClub(null)
  }

  return (
    <div className="space-y-6">
      {selectedClub ? (
        <ClubDetail club={selectedClub} onBack={handleBack} />
      ) : (
        <>
          <ClubsStats clubs={statsClubs} />
          <ClubsFilters clubs={clubs} />
          <ClubsTable clubs={clubs} onViewClub={handleViewClub} />
        </>
      )}
    </div>
  )
}
