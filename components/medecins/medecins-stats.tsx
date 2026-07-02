"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, Stethoscope, Trophy, Users } from "lucide-react"
import type { Medecin } from "@/lib/types"

export function MedecinsStats({ medecins }: { medecins: Medecin[] }) {
  const totalMedecins = medecins.length
  const medecinsActifs = medecins.filter((medecin) => medecin.statut === "actif").length
  const specialites = new Set(medecins.map((medecin) => medecin.specialite).filter(Boolean)).size
  const equipeNationale = medecins.filter((medecin) => medecin.equipeNationale).length

  const stats = [
    {
      title: "Médecins",
      value: totalMedecins,
      icon: Stethoscope,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Actifs",
      value: medecinsActifs,
      icon: BadgeCheck,
      color: "text-green-700",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Specialites",
      value: specialites,
      icon: Users,
      color: "text-blue-700",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Equipe nationale",
      value: equipeNationale,
      icon: Trophy,
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
