"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { dataQualityStats } from "@/lib/data/demo-data"

export function QualiteTable() {
  return (
    <div className="flex flex-col gap-6">
      {/* Tableau de complétude par entité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Complétude par Type d&apos;Entité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataQualityStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 font-medium text-sm">{stat.entite}</div>
                <div className="flex-1">
                  <Progress value={stat.tauxCompletude} className="h-2" />
                </div>
                <div className="w-16 text-right text-sm font-medium">
                  {stat.tauxCompletude}%
                </div>
                <div className="w-24 text-right text-xs text-muted-foreground">
                  {stat.complets}/{stat.total}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
