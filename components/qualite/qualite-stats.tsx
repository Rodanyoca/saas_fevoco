"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
} from "lucide-react"
import { dataQualityStats } from "@/lib/data/demo-data"

export function QualiteStats() {
  const totalCompletude = Math.round(
    dataQualityStats.reduce((acc, s) => acc + s.tauxCompletude, 0) / dataQualityStats.length
  )

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Complétude Global</p>
                <p className="text-2xl font-bold text-foreground">{totalCompletude}%</p>
              </div>
            </div>
          </div>
          <Progress value={totalCompletude} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
