"use client"

import { Card, CardContent } from "@/components/ui/card"
import { arbitres } from "@/lib/data/demo-data"
import { Flag, Award, Shield, AlertTriangle } from "lucide-react"

export function ArbitresStats() {
  const totalArbitres = arbitres.length
  const arbitresActifs = arbitres.filter(a => a.statut === "actif").length
  const arbitresInternationaux = arbitres.filter(a => a.grade === "International" || a.grade === "National").length
  const arbitresSuspendus = arbitres.filter(a => a.statut === "suspendu").length

  const stats = [
    {
      label: "Total Arbitres",
      value: totalArbitres,
      icon: Flag,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Arbitres Actifs",
      value: arbitresActifs,
      icon: Shield,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Grade National+",
      value: arbitresInternationaux,
      icon: Award,
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      label: "Suspendus",
      value: arbitresSuspendus,
      icon: AlertTriangle,
      color: "bg-secondary/10 text-secondary",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
