"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProvincesStats } from "@/components/provinces/provinces-stats"
import { ProvincesFilters } from "@/components/provinces/provinces-filters"
import { ProvincesTable } from "@/components/provinces/provinces-table"
import { ProvinceDetail } from "@/components/provinces/province-detail"
import { type Province } from "@/lib/data/demo-data"

export default function ProvincesPage() {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)

  const handleViewProvince = (province: Province) => {
    setSelectedProvince(province)
  }

  const handleBack = () => {
    setSelectedProvince(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {selectedProvince ? (
          <ProvinceDetail province={selectedProvince} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Provinces</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les provinces affiliées à la FEVOCO
              </p>
            </div>
            
            <ProvincesStats />
            <ProvincesFilters />
            <ProvincesTable onViewProvince={handleViewProvince} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
