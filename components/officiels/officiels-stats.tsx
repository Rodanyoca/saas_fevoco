"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Building2, UserCheck, Users } from "lucide-react"
import type { Officiel } from "@/lib/types"

export function OfficielsStats({ officiels }: { officiels: Officiel[] }) {
  const totalOfficiels = officiels.length
  const officielsActifs = officiels.filter((officiel) => officiel.statut === "actif").length
  const fonctionsUniques = new Set(officiels.map((officiel) => officiel.fonction).filter(Boolean)).size
  const entitesFederales = new Set(
    officiels
      .map((officiel) => officiel.equipeFederal || officiel.entite)
      .filter(Boolean)
  ).size

  const stats = [
    {
      label: "Officiels",
      value: totalOfficiels,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Actifs",
      value: officielsActifs,
      icon: UserCheck,
      color: "bg-success/10 text-success",
    },
    {
      label: "Fonctions",
      value: fonctionsUniques,
      icon: Briefcase,
      color: "bg-info/10 text-info",
    },
    {
      label: "Entités fédérales",
      value: entitesFederales,
      icon: Building2,
      color: "bg-warning/15 text-warning-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
