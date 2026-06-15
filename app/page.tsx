// FEVOCO Dashboard - Systeme de Gestion
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Progress } from "@/components/ui/progress"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { ProvinceChart } from "@/components/dashboard/province-chart"
import {
  getArbitres,
  getAthletes,
  getClubs,
  getCoachs,
  getEntentes,
  getLigues,
  getMedecins,
  getOfficiels,
  getProvinces,
} from "@/lib/data"
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

export const runtime = "nodejs"

export default async function DashboardPage() {
  const [provinces, ligues, ententes, clubs, athletes, coachs, arbitres, medecins, officiels] =
    await Promise.all([
      getProvinces(),
      getLigues(),
      getEntentes(),
      getClubs(),
      getAthletes(),
      getCoachs(),
      getArbitres(),
      getMedecins(),
      getOfficiels(),
    ])

  const statsGlobales = {
    totalProvinces: provinces.length,
    totalLigues: ligues.length,
    totalEntentes: ententes.length,
    totalClubs: clubs.length,
    totalAthletes: athletes.length,
    totalCoachs: coachs.length,
    totalArbitres: arbitres.length,
    totalMedecins: medecins.length,
    totalOfficiels: officiels.length,
    selectionNationale: athletes.filter((a) => a.selectionNationale).length,
    tauxCompletude: provinces.length
      ? Math.round(provinces.reduce((acc, p) => acc + (p.completude ?? 0), 0) / provinces.length)
      : 0,
  }

  const liguesActives = ligues.filter((l) => l.statut === "active").length
  const liguesInactives = ligues.filter((l) => l.statut === "inactive").length

  const ententesActives = ententes.filter((e) => e.statut === "active").length
  const ententesInactives = ententes.filter((e) => e.statut === "inactive").length

  const clubsMessieurs = clubs.filter((c) => c.genre === "Masculin").length
  const clubsDames = clubs.filter((c) => c.genre === "Féminin").length

  const athletesMasculins = athletes.filter((a) => a.genre === "M").length
  const athletesFeminins = athletes.filter((a) => a.genre === "F").length

  const coachsMasculins = coachs.filter((c) => c.genre === "M").length
  const coachsFeminins = coachs.filter((c) => c.genre === "F").length

  const arbitresMasculins = arbitres.filter((a) => a.genre === "M").length
  const arbitresFeminins = arbitres.filter((a) => a.genre === "F").length

  const medecinsMasculins = medecins.filter((m) => m.genre === "M").length
  const medecinsFeminins = medecins.filter((m) => m.genre === "F").length

  const officielsMasculins = officiels.filter((o) => o.genre === "M").length
  const officielsFeminins = officiels.filter((o) => o.genre === "F").length

  const selectionMasculins = athletes.filter((a) => a.selectionNationale && a.genre === "M").length
  const selectionFeminins = athletes.filter((a) => a.selectionNationale && a.genre === "F").length

  const genreData = [
    { genre: "Masculin", count: athletesMasculins + coachsMasculins + arbitresMasculins + medecinsMasculins + officielsMasculins },
    { genre: "Féminin", count: athletesFeminins + coachsFeminins + arbitresFeminins + medecinsFeminins + officielsFeminins },
  ]

  const activities = [
    {
      id: "a-clubs",
      type: "club" as const,
      action: "Mise à jour des clubs",
      date: new Date().toISOString(),
      description: `${clubs.length} clubs chargés depuis Google Sheets`,
    },
    {
      id: "a-athletes",
      type: "athlete" as const,
      action: "Mise à jour des athlètes",
      date: new Date().toISOString(),
      description: `${athletes.length} athlètes chargés depuis Google Sheets`,
    },
    {
      id: "a-ligues",
      type: "ligue" as const,
      action: "Mise à jour des ligues",
      date: new Date().toISOString(),
      description: `${ligues.length} ligues chargées depuis Google Sheets`,
    },
    {
      id: "a-ententes",
      type: "entente" as const,
      action: "Mise à jour des ententes",
      date: new Date().toISOString(),
      description: `${ententes.length} ententes chargées depuis Google Sheets`,
    },
  ]

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
            subIndicators={[
              { label: "Actives", value: liguesActives },
              { label: "Inactives", value: liguesInactives },
            ]}
          />
          <KpiCard
            title="Ententes"
            value={statsGlobales.totalEntentes}
            icon={Network}
            subIndicators={[
              { label: "Actives", value: ententesActives },
              { label: "Inactives", value: ententesInactives },
            ]}
          />
          <KpiCard
            title="Clubs"
            value={statsGlobales.totalClubs}
            icon={Shield}
            variant="primary"
            subIndicators={[
              { label: "Messieurs", value: clubsMessieurs },
              { label: "Dames", value: clubsDames },
            ]}
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
            subIndicators={[
              { label: "Masculin", value: coachsMasculins },
              { label: "Féminin", value: coachsFeminins },
            ]}
          />
          <KpiCard
            title="Arbitres"
            value={statsGlobales.totalArbitres}
            icon={Flag}
            subIndicators={[
              { label: "Masculin", value: arbitresMasculins },
              { label: "Féminin", value: arbitresFeminins },
            ]}
          />
          <KpiCard
            title="Medecins"
            value={statsGlobales.totalMedecins}
            icon={Stethoscope}
            subIndicators={[
              { label: "Masculin", value: medecinsMasculins },
              { label: "Féminin", value: medecinsFeminins },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Officiels"
            value={statsGlobales.totalOfficiels}
            icon={UserCog}
            subIndicators={[
              { label: "Masculin", value: officielsMasculins },
              { label: "Féminin", value: officielsFeminins },
            ]}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <DashboardClient provinces={provinces} activities={activities} genreData={genreData} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ProvinceChart provinces={provinces} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
