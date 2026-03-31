"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { QualiteStats } from "@/components/qualite/qualite-stats"
import { QualiteFilters } from "@/components/qualite/qualite-filters"
import { QualiteTable } from "@/components/qualite/qualite-table"

export default function QualitePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Qualité des Données</h1>
          <p className="text-muted-foreground mt-1">
            Surveillez et améliorez la qualité des données de la FEVOCO
          </p>
        </div>
        
        <QualiteStats />
        <QualiteFilters />
        <QualiteTable />
      </div>
    </DashboardLayout>
  )
}
