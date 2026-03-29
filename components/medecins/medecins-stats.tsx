"use client"

import { Card, CardContent } from "@/components/ui/card"
import { medecins } from "@/lib/data/demo-data"
import { Stethoscope, UserCheck, Activity, Users } from "lucide-react"

export function MedecinsStats() {
  const totalMedecins = medecins.length
  const medecinsActifs = medecins.filter(m => m.statut === "actif").length
  const medecinsSport = medecins.filter(m => m.specialite === "Médecine du sport").length
  const totalAthletesReferrals = medecins.reduce((acc, m) => acc + m.athletesSuivis, 0)

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
      bgColor: "bg-green-100",
    },
    {
      title: "Médecine du Sport",
      value: medecinsSport,
      icon: Activity,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "Athlètes Suivis",
      value: totalAthletesReferrals,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border">
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
