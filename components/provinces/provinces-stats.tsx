"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Building2, Users, TrendingUp } from "lucide-react"
import type { Province } from "@/lib/types"

export function ProvincesStats({ provinces }: { provinces: Province[] }) {
  const totalProvinces = provinces.length
  const provincesActives = provinces.filter(p => p.statut === "active").length
  const totalAthletes = provinces.reduce((acc, p) => acc + p.athletes, 0)
  const moyenneCompletude = provinces.length
    ? Math.round(provinces.reduce((acc, p) => acc + p.completude, 0) / provinces.length)
    : 0

  const stats = [
    {
      label: "Total Provinces",
      value: totalProvinces,
      icon: MapPin,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Provinces Actives",
      value: provincesActives,
      icon: Building2,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Total Athlètes",
      value: totalAthletes,
      icon: Users,
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      label: "Complétude Moyenne",
      value: `${moyenneCompletude}%`,
      icon: TrendingUp,
      color: "bg-secondary/10 text-secondary",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
