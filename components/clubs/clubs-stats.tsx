"use client"

import { Card, CardContent } from "@/components/ui/card"
import { clubs, statsGlobales } from "@/lib/data/demo-data"
import { Shield, Users, CheckCircle, XCircle } from "lucide-react"

const clubsMessieurs = clubs.filter((c) => c.genre === "Masculin").length
const clubsDames = clubs.filter((c) => c.genre === "Féminin").length

const stats = [
  {
    title: "Total Clubs",
    value: statsGlobales.totalClubs,
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Clubs Actifs",
    value: statsGlobales.clubsActifs,
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Clubs Inactifs",
    value: statsGlobales.clubsInactifs,
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Total Athlètes",
    value: statsGlobales.totalAthletes,
    icon: Users,
    color: "text-accent-foreground",
    bgColor: "bg-accent/10",
  },
]

export function ClubsStats() {
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
                {stat.title === "Total Clubs" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Messieurs: {clubsMessieurs} • Dames: {clubsDames}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
