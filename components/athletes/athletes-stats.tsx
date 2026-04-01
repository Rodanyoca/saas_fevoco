"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Award } from "lucide-react"
import type { Athlete } from "@/lib/types"

export function AthletesStats({ athletes }: { athletes: Athlete[] }) {
  const totalAthletes = athletes.length
  const actifs = athletes.filter((a) => a.statut === "actif").length
  const inactifs = athletes.filter((a) => a.statut === "inactif").length
  const selectionNationale = athletes.filter((a) => a.selectionNationale === true).length

  const stats = [
    {
      title: "Total Athlètes",
      value: totalAthletes.toLocaleString(),
      icon: Users,
      description: "Inscrits à la FEVOCO",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Actifs",
      value: actifs.toString(),
      icon: UserCheck,
      description: "En activité",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Sélection Nationale",
      value: selectionNationale.toString(),
      icon: Award,
      description: "Membres de l'équipe nationale",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Inactifs",
      value: inactifs.toString(),
      icon: UserX,
      description: "Non actifs",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
