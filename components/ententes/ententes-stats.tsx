"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Network, Shield, Users, CheckCircle } from "lucide-react"
import { ententes, statsGlobales } from "@/lib/data/demo-data"

const ententesActives = ententes.filter((e) => e.statut === "active").length
const ententesInactives = ententes.filter((e) => e.statut === "inactive").length

const stats = [
  {
    title: "Total Ententes",
    value: statsGlobales.totalEntentes,
    icon: Network,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Ententes Actives",
    value: ententesActives,
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Clubs Affiliés",
    value: ententes.reduce((acc, e) => acc + e.clubs, 0),
    icon: Shield,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "Athlètes Inscrits",
    value: ententes.reduce((acc, e) => acc + e.athletes, 0),
    icon: Users,
    color: "text-accent-foreground",
    bgColor: "bg-accent/10",
  },
]

export function EntentesStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                {stat.title === "Total Ententes" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Actives: {ententesActives} • Inactives: {ententesInactives}
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
