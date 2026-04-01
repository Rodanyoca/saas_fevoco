"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, CheckCircle, XCircle } from "lucide-react"
import type { Club } from "@/lib/types"

export function ClubsStats({ clubs }: { clubs: Club[] }) {
  const totalClubs = clubs.length
  const clubsActifs = clubs.filter((c) => c.statut === "actif").length
  const clubsInactifs = clubs.filter((c) => c.statut === "inactif").length
  const totalAthletes = clubs.reduce((acc, c) => acc + (c.athletes ?? 0), 0)

  const stats = [
    {
      title: "Total Clubs",
      value: totalClubs,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Clubs Actifs",
      value: clubsActifs,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Clubs Inactifs",
      value: clubsInactifs,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Athlètes",
      value: totalAthletes,
      icon: Users,
      color: "text-accent-foreground",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
