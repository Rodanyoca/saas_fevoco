"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from "lucide-react"
import { dataQualityStats, dataQualityIssues } from "@/lib/data/demo-data"

export function QualiteStats() {
  const totalCompletude = Math.round(
    dataQualityStats.reduce((acc, s) => acc + s.tauxCompletude, 0) / dataQualityStats.length
  )
  
  const issuesNonResolues = dataQualityIssues.filter(i => i.statut === "non_resolu").length
  const issuesEnCours = dataQualityIssues.filter(i => i.statut === "en_cours").length
  const issuesResolues = dataQualityIssues.filter(i => i.statut === "resolu").length

  const stats = [
    {
      title: "Taux de Complétude Global",
      value: `${totalCompletude}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      progress: totalCompletude,
    },
    {
      title: "Problèmes Non Résolus",
      value: issuesNonResolues.toString(),
      icon: XCircle,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "En Cours de Résolution",
      value: issuesEnCours.toString(),
      icon: AlertTriangle,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Problèmes Résolus",
      value: issuesResolues.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            {stat.progress !== undefined && (
              <div className="mt-4">
                <Progress value={stat.progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
