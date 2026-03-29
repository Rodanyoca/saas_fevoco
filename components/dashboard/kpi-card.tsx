import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "default" | "primary" | "secondary" | "accent"
}

export function KpiCard({ title, value, icon: Icon, trend, variant = "default" }: KpiCardProps) {
  const variantStyles = {
    default: "bg-card text-card-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  }

  const iconStyles = {
    default: "bg-muted text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    secondary: "bg-secondary-foreground/20 text-secondary-foreground",
    accent: "bg-accent-foreground/20 text-accent-foreground",
  }

  return (
    <Card className={cn("border-0 shadow-sm", variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-xs font-medium uppercase tracking-wider mb-1",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {title}
            </p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.positive ? "text-green-600" : "text-red-500"
              )}>
                {trend.positive ? "+" : ""}{trend.value}% vs mois dernier
              </p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-lg", iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
