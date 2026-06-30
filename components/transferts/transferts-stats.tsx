import { ArrowRightLeft, BadgeCheck, Clock, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Transfert } from "@/lib/types"

function isValidated(statut: string) {
  const value = statut.trim().toLowerCase()
  return value === "valide" || value === "validé" || value === "active" || value === "actif"
}

function isPending(statut: string) {
  return statut.trim().toLowerCase() === "en attente"
}

function isRejected(statut: string) {
  const value = statut.trim().toLowerCase()
  return value === "rejete" || value === "rejeté" || value === "refuse" || value === "refusé"
}

export function TransfertsStats({ transferts }: { transferts: Transfert[] }) {
  const stats = [
    {
      label: "Transferts",
      value: transferts.length,
      icon: ArrowRightLeft,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Valides",
      value: transferts.filter((transfert) => isValidated(transfert.statut)).length,
      icon: BadgeCheck,
      color: "text-green-700",
      bg: "bg-green-500/10",
    },
    {
      label: "En attente",
      value: transferts.filter((transfert) => isPending(transfert.statut)).length,
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-500/10",
    },
    {
      label: "Rejetes",
      value: transferts.filter((transfert) => isRejected(transfert.statut)).length,
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
