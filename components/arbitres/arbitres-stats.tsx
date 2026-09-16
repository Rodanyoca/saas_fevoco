"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Award, Flag, Shield, Trophy } from "lucide-react"
import type { Arbitre } from "@/lib/types"

export function ArbitresStats({ arbitres }: { arbitres: Arbitre[] }) {
  const totalArbitres = arbitres.length
  const arbitresActifs = arbitres.filter((arbitre) => arbitre.statut === "actif").length
  const grades = new Set(arbitres.map((arbitre) => arbitre.grade).filter(Boolean)).size
  const equipeNationale = arbitres.filter((arbitre) => arbitre.equipeNational).length

  const stats = [
    {
      label: "Arbitres",
      value: totalArbitres,
      icon: Flag,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Actifs",
      value: arbitresActifs,
      icon: Shield,
      color: "bg-success/10 text-success",
    },
    {
      label: "Grades",
      value: grades,
      icon: Award,
      color: "bg-info/10 text-info",
    },
    {
      label: "Équipe nationale",
      value: equipeNationale,
      icon: Trophy,
      color: "bg-warning/15 text-warning-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
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
