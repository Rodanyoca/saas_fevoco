"use client"

import { useState } from "react"
import type { Officiel } from "@/lib/types"
import { OfficielsStats } from "@/components/officiels/officiels-stats"
import { OfficielsFilters } from "@/components/officiels/officiels-filters"
import { OfficielsTable } from "@/components/officiels/officiels-table"
import { OfficielDetail } from "@/components/officiels/officiel-detail"

export function OfficielsClient({ officiels }: { officiels: Officiel[] }) {
  const [selectedOfficiel, setSelectedOfficiel] = useState<Officiel | null>(null)

  const handleViewOfficiel = (officiel: Officiel) => {
    setSelectedOfficiel(officiel)
  }

  const handleBack = () => {
    setSelectedOfficiel(null)
  }

  return (
    <div className="space-y-6">
      {selectedOfficiel ? (
        <OfficielDetail officiel={selectedOfficiel} onBack={handleBack} />
      ) : (
        <>
          <OfficielsStats officiels={officiels} />
          <OfficielsFilters officiels={officiels} />
          <OfficielsTable officiels={officiels} onViewOfficiel={handleViewOfficiel} />
        </>
      )}
    </div>
  )
}
