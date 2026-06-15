"use client"

import { useState } from "react"
import type { Club, Entente, Ligue, Province } from "@/lib/types"
import { ProvincesStats } from "@/components/provinces/provinces-stats"
import { ProvincesFilters } from "@/components/provinces/provinces-filters"
import { ProvincesTable } from "@/components/provinces/provinces-table"
import { ProvinceDetail } from "@/components/provinces/province-detail"

export function ProvincesClient({
  provinces,
  ligues,
  ententes,
  clubs,
}: {
  provinces: Province[]
  ligues: Ligue[]
  ententes: Entente[]
  clubs: Club[]
}) {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)

  const handleViewProvince = (province: Province) => {
    setSelectedProvince(province)
  }

  const handleBack = () => {
    setSelectedProvince(null)
  }

  return (
    <div className="space-y-6">
      {selectedProvince ? (
        <ProvinceDetail
          province={selectedProvince}
          ligues={ligues}
          ententes={ententes}
          clubs={clubs}
          onBack={handleBack}
        />
      ) : (
        <>
          <ProvincesStats provinces={provinces} />
          <ProvincesFilters provinces={provinces} />
          <ProvincesTable provinces={provinces} onViewProvince={handleViewProvince} />
        </>
      )}
    </div>
  )
}
