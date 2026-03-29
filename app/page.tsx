// FEVOCO Dashboard - Systeme de Gestion
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { StatsTable } from "@/components/dashboard/stats-table"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { GenreChart } from "@/components/dashboard/genre-chart"
import { ProvinceChart } from "@/components/dashboard/province-chart"
import { AlertsCard } from "@/components/dashboard/alerts-card"
import { statsGlobales } from "@/lib/data/demo-data"
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
} from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Header
        title="Tableau de Bord"
        subtitle="Vue globale du systeme national de volleyball"
      />

      <div className="p-6 space-y-6">
        {/* Section Titre */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Statistiques Generales</h2>
            <p className="text-sm text-muted-foreground">Donnees consolidees de la federation</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Derniere mise a jour</p>
            <p className="text-sm font-medium text-foreground">29 Mars 2024</p>
          </div>
        </div>

        {/* KPI Cards - Structure organisationnelle */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <KpiCard
            title="Athletes"
            value={statsGlobales.totalAthletes}
            icon={Users}
            variant="secondary"
          />
        </div>

        {/* KPI Cards - Personnel technique */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <KpiCard
            title="Selection Nationale"
            value={statsGlobales.selectionNationale}
            icon={Target}
            variant="accent"
          />
          <KpiCard
            title="Taux Completude"
            value={`${statsGlobales.tauxCompletude}%`}
            icon={CheckCircle}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProvinceChart />
          <GenreChart />
          <AlertsCard />
        </div>

        {/* Table and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatsTable />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
