// FEVOCO Dashboard - Systeme de Gestion
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Progress } from "@/components/ui/progress"
import { athletes, statsGlobales } from "@/lib/data/demo-data"
import {
  MapPin,
  Building2,
  Shield,
  Users,
  UserCheck,
  Flag,
  Target,
  CheckCircle,
  Stethoscope,
  Network,
  UserCog,
} from "lucide-react"

export default function DashboardPage() {
  const athletesMasculins = athletes.filter((a) => a.genre === "M").length
  const athletesFeminins = athletes.filter((a) => a.genre === "F").length
  const selectionMasculins = athletes.filter((a) => a.selectionNationale && a.genre === "M").length
  const selectionFeminins = athletes.filter((a) => a.selectionNationale && a.genre === "F").length

  return (
    <DashboardLayout>
      <Header
        title="Tableau de Bord"
        subtitle="Vue globale du systeme national de volleyball"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards - Structure organisationnelle */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <KpiCard
            title="Provinces"
            value={statsGlobales.totalProvinces}
            icon={MapPin}
          />
          <KpiCard
            title="Ligues"
            value={statsGlobales.totalLigues}
            icon={Building2}
          />
          <KpiCard
            title="Ententes"
            value={statsGlobales.totalEntentes}
            icon={Network}
          />
          <KpiCard
            title="Clubs"
            value={statsGlobales.totalClubs}
            icon={Shield}
            variant="primary"
          />
        </div>

        {/* KPI Cards - Personnel technique */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="Athletes"
            value={statsGlobales.totalAthletes}
            icon={Users}
            variant="secondary"
            subIndicators={[
              { label: "Masculin", value: athletesMasculins },
              { label: "Féminin", value: athletesFeminins },
            ]}
          />
          <KpiCard
            title="Coachs"
            value={statsGlobales.totalCoachs}
            icon={UserCheck}
          />
          <KpiCard
            title="Arbitres"
            value={statsGlobales.totalArbitres}
            icon={Flag}
          />
          <KpiCard
            title="Medecins"
            value={statsGlobales.totalMedecins}
            icon={Stethoscope}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Officiels"
            value={statsGlobales.totalOfficiels}
            icon={UserCog}
          />

          <KpiCard
            title="Selection Nationale"
            value={statsGlobales.selectionNationale}
            icon={Target}
            variant="accent"
            subIndicators={[
              { label: "Masculin", value: selectionMasculins },
              { label: "Féminin", value: selectionFeminins },
            ]}
          />

          <div className="md:col-span-2">
            <div className="rounded-xl border border-border/50 bg-card shadow-sm p-5 h-full">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                    Taux Completude
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{statsGlobales.tauxCompletude}%</p>
                    <p className="text-xs text-muted-foreground">dossiers complets</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={statsGlobales.tauxCompletude} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
