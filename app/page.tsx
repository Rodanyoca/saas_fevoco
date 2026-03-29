// FEVOCO Dashboard - Système de Gestion v2
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
} from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Header
        title="Tableau de Bord"
        subtitle="Vue globale du système national de volleyball"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards - Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            title="Clubs"
            value={statsGlobales.totalClubs}
            icon={Shield}
            variant="primary"
          />
          <KpiCard
            title="Athlètes"
            value={statsGlobales.totalAthletes}
            icon={Users}
            variant="secondary"
          />
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            title="Sélection Nationale"
            value={statsGlobales.selectionNationale}
            icon={Target}
            variant="accent"
          />
          <KpiCard
            title="Taux Complétude"
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
