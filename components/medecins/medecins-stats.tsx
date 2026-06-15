"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, UserCheck, Activity, Users } from "lucide-react"
import type { Medecin } from "@/lib/types"

export function MedecinsStats({ medecins }: { medecins: Medecin[] }) {
  const totalMedecins = medecins.length
  const medecinsActifs = medecins.filter((m) => m.statut === "actif").length
  const medecinsInactifs = medecins.filter((m) => m.statut === "inactif").length
  const specialitesUniques = new Set(medecins.map((m) => m.specialite).filter(Boolean)).size

  const stats = [
    {
      title: "Total Médecins",
      value: totalMedecins,
      icon: Stethoscope,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Médecins Actifs",
      value: medecinsActifs,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Médecins inactifs",
      value: medecinsInactifs,
      icon: Activity,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "Clubs suivis",
      value: specialitesUniques,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
