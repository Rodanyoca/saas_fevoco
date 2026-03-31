"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ClubsStats } from "@/components/clubs/clubs-stats"
import { ClubsFilters } from "@/components/clubs/clubs-filters"
import { ClubsTable } from "@/components/clubs/clubs-table"
import { ClubDetail } from "@/components/clubs/club-detail"
import { type Club } from "@/lib/data/demo-data"

export default function ClubsPage() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  const handleViewClub = (club: Club) => {
    setSelectedClub(club)
  }

  const handleBack = () => {
    setSelectedClub(null)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {selectedClub ? (
          <ClubDetail club={selectedClub} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Clubs</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les clubs affiliés à la FEVOCO
              </p>
            </div>

            <ClubsStats />

            <ClubsFilters />

            <ClubsTable onViewClub={handleViewClub} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
