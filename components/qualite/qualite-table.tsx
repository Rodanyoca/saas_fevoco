"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { QualityStat } from "@/lib/quality"

export function QualiteTable({ stats }: { stats: QualityStat[] }) {
  const getBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Excellent</Badge>
    if (rate >= 70) return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Correct</Badge>
    if (rate >= 50) return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">A surveiller</Badge>
    return <Badge variant="destructive">Critique</Badge>
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Completude par type d&apos;entite</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length > 0 ? (
          <div className="space-y-4">
            {stats.map((stat) => (
              <div
                key={stat.entite}
                className="grid gap-3 rounded-md border border-border/60 p-4 lg:grid-cols-[220px_1fr_90px_120px] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{stat.entite}</p>
                  <p className="text-xs text-muted-foreground">{stat.total.toLocaleString()} lignes</p>
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>{stat.complets.toLocaleString()} completes</span>
                    <span>{stat.incomplets.toLocaleString()} incompletes</span>
                  </div>
                  <Progress value={stat.tauxCompletude} className="h-2" />
                </div>
                <div className="text-lg font-semibold text-foreground">{stat.tauxCompletude}%</div>
                <div>{getBadge(stat.tauxCompletude)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Aucune entite ne correspond aux filtres.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
