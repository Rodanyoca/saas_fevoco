import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Award } from "lucide-react"
import type { Coach } from "@/lib/types"

export function CoachsStats({ coachs }: { coachs: Coach[] }) {
  const totalCoachs = coachs.length
  const coachsActifs = coachs.filter((c) => c.statut === "actif").length
  const coachsNational = coachs.filter((c) => c.niveau === "National").length

  const stats = [
    {
      title: "Total Coachs",
      value: totalCoachs,
      icon: Users,
      description: "Entraîneurs enregistrés",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Coachs Actifs",
      value: coachsActifs,
      icon: UserCheck,
      description: "En activité",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Certification Nationale",
      value: coachsNational,
      icon: Award,
      description: "Plus haut niveau",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
