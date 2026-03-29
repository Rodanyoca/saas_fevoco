"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { QualiteStats } from "@/components/qualite/qualite-stats"
import { QualiteFilters } from "@/components/qualite/qualite-filters"
import { QualiteTable } from "@/components/qualite/qualite-table"
import { QualiteDetail } from "@/components/qualite/qualite-detail"
import { type DataQualityIssue } from "@/lib/data/demo-data"

export default function QualitePage() {
  const [selectedIssue, setSelectedIssue] = useState<DataQualityIssue | null>(null)

  const handleViewIssue = (issue: DataQualityIssue) => {
    setSelectedIssue(issue)
  }

  const handleBack = () => {
    setSelectedIssue(null)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {selectedIssue ? (
          <QualiteDetail issue={selectedIssue} onBack={handleBack} />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Qualité des Données</h1>
              <p className="text-muted-foreground mt-1">
                Surveillez et améliorez la qualité des données de la FEVOCO
              </p>
            </div>
            
            <QualiteStats />
            <QualiteFilters />
            <QualiteTable onViewIssue={handleViewIssue} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
