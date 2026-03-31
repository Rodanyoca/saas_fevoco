"use client"

import { Card, CardContent } from "@/components/ui/card"
import { officiels } from "@/lib/data/demo-data"
import { Users, UserCheck, AlertTriangle, Briefcase } from "lucide-react"

export function OfficielsStats() {
  const totalOfficiels = officiels.length
  const officielsActifs = officiels.filter((o) => o.statut === "actif").length
  const officielsInactifs = officiels.filter((o) => o.statut === "inactif").length
  const postesUniques = new Set(officiels.map((o) => o.poste)).size
  const masculins = officiels.filter((o) => o.genre === "M").length
  const feminins = officiels.filter((o) => o.genre === "F").length

  const stats = [
    {
      label: "Total Officiels",
      value: totalOfficiels,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Officiels Actifs",
      value: officielsActifs,
      icon: UserCheck,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Postes",
      value: postesUniques,
      icon: Briefcase,
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      label: "Inactifs",
      value: officielsInactifs,
      icon: AlertTriangle,
      color: "bg-secondary/10 text-secondary",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.label === "Total Officiels" && (
                  <p className="text-xs text-muted-foreground mt-1">Masculin: {masculins} • Féminin: {feminins}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
