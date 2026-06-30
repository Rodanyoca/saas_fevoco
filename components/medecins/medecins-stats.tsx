"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, Building2, Stethoscope, Users } from "lucide-react"
import type { Medecin } from "@/lib/types"

export function MedecinsStats({ medecins }: { medecins: Medecin[] }) {
  const totalMedecins = medecins.length
  const affiliationsActives = medecins.reduce(
    (total, medecin) =>
      total + medecin.affiliations.filter((affiliation) => affiliation.statut === "actif").length,
    0
  )
  const liguesCouvertes = new Set(medecins.map((medecin) => medecin.ligueNom).filter(Boolean)).size
  const clubsSuivis = new Set(medecins.map((medecin) => medecin.clubNom).filter(Boolean)).size

  const stats = [
    {
      title: "Médecins",
      value: totalMedecins,
      icon: Stethoscope,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Affiliations actives",
      value: affiliationsActives,
      icon: Activity,
      color: "text-green-700",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Ligues couvertes",
      value: liguesCouvertes,
      icon: Building2,
      color: "text-blue-700",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Clubs suivis",
      value: clubsSuivis,
      icon: Users,
      color: "text-amber-700",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
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
