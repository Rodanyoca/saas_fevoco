"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { OfficielsStats } from "@/components/officiels/officiels-stats"
import { OfficielsFilters } from "@/components/officiels/officiels-filters"
import { OfficielsTable } from "@/components/officiels/officiels-table"
import { OfficielDetail } from "@/components/officiels/officiel-detail"
import { type Officiel } from "@/lib/data/demo-data"

export default function OfficielsPage() {
  const [selectedOfficiel, setSelectedOfficiel] = useState<Officiel | null>(null)

  const handleViewOfficiel = (officiel: Officiel) => {
    setSelectedOfficiel(officiel)
  }

  const handleBack = () => {
    setSelectedOfficiel(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {selectedOfficiel ? (
          <OfficielDetail officiel={selectedOfficiel} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Officiels</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les officiels administratifs de la FEVOCO
              </p>
            </div>

            <OfficielsStats />
            <OfficielsFilters />
            <OfficielsTable onViewOfficiel={handleViewOfficiel} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
