"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getGlobalQualityRate, type QualityStat } from "@/lib/quality"
import { AlertTriangle, CheckCircle, Database, TrendingUp } from "lucide-react"

export function QualiteStats({ stats }: { stats: QualityStat[] }) {
  const totalCompletude = getGlobalQualityRate(stats)
  const total = stats.reduce((acc, stat) => acc + stat.total, 0)
  const complets = stats.reduce((acc, stat) => acc + stat.complets, 0)
  const incomplets = stats.reduce((acc, stat) => acc + stat.incomplets, 0)

  const cards = [
    {
      label: "Completude globale",
      value: `${totalCompletude}%`,
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Lignes analysees",
      value: total,
      icon: Database,
      color: "bg-blue-500/10 text-blue-700",
    },
    {
      label: "Completes",
      value: complets,
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-700",
    },
    {
      label: "Incompletes",
      value: incomplets,
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground">{card.value.toLocaleString()}</p>
              </div>
            </div>
            {card.label === "Completude globale" ? (
              <Progress value={totalCompletude} className="mt-4 h-2" />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
