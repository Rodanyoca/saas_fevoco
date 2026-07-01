"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Athlete } from "@/lib/types"
import { UserCheck, Users, UserX } from "lucide-react"

export function AthletesStats({ athletes }: { athletes: Athlete[] }) {
  const totalAthletes = athletes.length
  const actifs = athletes.filter((athlete) => athlete.statut === "actif").length
  const inactifs = athletes.filter((athlete) => athlete.statut === "inactif").length

  const stats = [
    {
      title: "Total Athletes",
      value: totalAthletes.toLocaleString(),
      icon: Users,
      description: "Inscrits a la FEVOCO",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Actifs",
      value: actifs.toString(),
      icon: UserCheck,
      description: "En activite",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
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
    <div className="grid gap-4 md:grid-cols-3">
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
            <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
