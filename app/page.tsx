import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { GenreChart } from "@/components/dashboard/genre-chart"
import { Header } from "@/components/dashboard/header"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { ProvinceChart } from "@/components/dashboard/province-chart"
import { StatsTable } from "@/components/dashboard/stats-table"
import { Progress } from "@/components/ui/progress"
import {
  getArbitres,
  getAthletes,
  getClubs,
  getCoachs,
  getCompetitionResults,
  getCompetitions,
  getCompetitionUnites,
  getEquipeNationale,
  getEquipeNationaleSuivi,
  getEntentes,
  getLigues,
  getMedecins,
  getOfficiels,
  getProvinces,
  getTransferts,
} from "@/lib/data"
import { createQualityStats } from "@/lib/quality"
import {
  ArrowRightLeft,
  Building2,
  CalendarCheck,
  CheckCircle,
  Flag,
  MapPin,
  Network,
  Shield,
  Stethoscope,
  Target,
  Trophy,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalizeValue(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isActive(value: string | null | undefined): boolean {
  const normalized = normalizeValue(value)
  return normalized === "actif" || normalized === "active" || normalized === "en cours"
}

function isInactive(value: string | null | undefined): boolean {
  const normalized = normalizeValue(value)
  return normalized === "inactif" || normalized === "inactive" || normalized === "annule"
}

function isValidated(value: string | null | undefined): boolean {
  const normalized = normalizeValue(value)
  return normalized === "valide" || normalized === "validee" || normalized === "approuve" || normalized === "approuvee"
}

function isBeach(value: string | null | undefined): boolean {
  return normalizeValue(value).includes("beach")
}

function isIndoor(value: string | null | undefined): boolean {
  return normalizeValue(value).includes("indoor")
}

export default async function DashboardPage() {
  const [
    provinces,
    ligues,
    ententes,
    clubs,
    athletes,
    coachs,
    arbitres,
    medecins,
    officiels,
    competitions,
    competitionUnites,
    competitionResults,
    transferts,
    equipeNationale,
    equipeNationaleSuivi,
  ] = await Promise.all([
    getProvinces(),
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
    getCoachs(),
    getArbitres(),
    getMedecins(),
    getOfficiels(),
    getCompetitions(),
    getCompetitionUnites(),
    getCompetitionResults(),
    getTransferts(),
    getEquipeNationale(),
    getEquipeNationaleSuivi(),
  ])

  const qualityStats = createQualityStats({
    provinces,
    ligues,
    ententes,
    clubs,
    athletes,
    coachs,
    arbitres,
    medecins,
    officiels,
    competitions,
    competitionUnites,
    competitionResults,
    transferts,
    equipeNationale,
    equipeNationaleSuivi,
  })
  const totalRecords = qualityStats.reduce((acc, stat) => acc + stat.total, 0)
  const totalCompleteRecords = qualityStats.reduce((acc, stat) => acc + stat.complets, 0)
  const tauxCompletude = totalRecords ? Math.round((totalCompleteRecords / totalRecords) * 100) : 0

  const liguesActives = ligues.filter((ligue) => isActive(ligue.statut)).length
  const liguesInactives = ligues.filter((ligue) => isInactive(ligue.statut)).length
  const ententesActives = ententes.filter((entente) => isActive(entente.statut)).length
  const ententesInactives = ententes.filter((entente) => isInactive(entente.statut)).length
  const clubsActifs = clubs.filter((club) => isActive(club.statut)).length
  const clubsInactifs = clubs.filter((club) => isInactive(club.statut)).length

  const athletesMasculins = athletes.filter((athlete) => athlete.genre === "M").length
  const athletesFeminins = athletes.filter((athlete) => athlete.genre === "F").length
  const coachsMasculins = coachs.filter((coach) => coach.genre === "M").length
  const coachsFeminins = coachs.filter((coach) => coach.genre === "F").length
  const arbitresMasculins = arbitres.filter((arbitre) => arbitre.genre === "M").length
  const arbitresFeminins = arbitres.filter((arbitre) => arbitre.genre === "F").length
  const medecinsMasculins = medecins.filter((medecin) => medecin.genre === "M").length
  const medecinsFeminins = medecins.filter((medecin) => medecin.genre === "F").length
  const officielsMasculins = officiels.filter((officiel) => officiel.genre === "M").length
  const officielsFeminins = officiels.filter((officiel) => officiel.genre === "F").length
  const selectionMasculins = equipeNationale.filter((selection) => selection.genre === "M").length
  const selectionFeminins = equipeNationale.filter((selection) => selection.genre === "F").length

  const competitionsIndoor = competitions.filter((competition) => isIndoor(competition.discipline)).length
  const competitionsBeach = competitions.filter((competition) => isBeach(competition.discipline)).length
  const competitionsActives = competitions.filter((competition) => isActive(competition.statut)).length
  const matchsJoues = competitionResults.filter((result) => result.scoreGlobal || isValidated(result.statutMatch)).length
  const transfertsValides = transferts.filter((transfert) => isValidated(transfert.statut)).length
  const transfertsEnCours = transferts.filter((transfert) => isActive(transfert.statut) && !isValidated(transfert.statut)).length

  const genreData = [
    {
      genre: "Masculin",
      count: athletesMasculins + coachsMasculins + arbitresMasculins + medecinsMasculins + officielsMasculins,
    },
    {
      genre: "Feminin",
      count: athletesFeminins + coachsFeminins + arbitresFeminins + medecinsFeminins + officielsFeminins,
    },
  ]

  return (
    <DashboardLayout>
      <Header title="Tableau de bord" subtitle="Vue globale du systeme national de volleyball" />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:col-span-8">
            <KpiCard title="Provinces" value={provinces.length} icon={MapPin} />
            <KpiCard
              title="Ligues"
              value={ligues.length}
              icon={Building2}
              subIndicators={[
                { label: "Actives", value: liguesActives },
                { label: "Inactives", value: liguesInactives },
              ]}
            />
            <KpiCard
              title="Ententes"
              value={ententes.length}
              icon={Network}
              subIndicators={[
                { label: "Actives", value: ententesActives },
                { label: "Inactives", value: ententesInactives },
              ]}
            />
            <KpiCard
              title="Clubs"
              value={clubs.length}
              icon={Shield}
              variant="primary"
              subIndicators={[
                { label: "Actifs", value: clubsActifs },
                { label: "Inactifs", value: clubsInactifs },
              ]}
            />
            <KpiCard
              title="Athletes"
              value={athletes.length}
              icon={Users}
              variant="secondary"
              subIndicators={[
                { label: "Masculin", value: athletesMasculins },
                { label: "Feminin", value: athletesFeminins },
              ]}
            />
            <KpiCard
              title="Coachs"
              value={coachs.length}
              icon={UserCheck}
              subIndicators={[
                { label: "Masculin", value: coachsMasculins },
                { label: "Feminin", value: coachsFeminins },
              ]}
            />
            <KpiCard
              title="Arbitres"
              value={arbitres.length}
              icon={Flag}
              subIndicators={[
                { label: "Masculin", value: arbitresMasculins },
                { label: "Feminin", value: arbitresFeminins },
              ]}
            />
            <KpiCard
              title="Medecins"
              value={medecins.length}
              icon={Stethoscope}
              subIndicators={[
                { label: "Masculin", value: medecinsMasculins },
                { label: "Feminin", value: medecinsFeminins },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:col-span-4 2xl:grid-cols-1">
            <KpiCard
              title="Officiels"
              value={officiels.length}
              icon={UserCog}
              subIndicators={[
                { label: "Masculin", value: officielsMasculins },
                { label: "Feminin", value: officielsFeminins },
              ]}
            />
            <KpiCard
              title="Competitions"
              value={competitions.length}
              icon={Trophy}
              variant="accent"
              subIndicators={[
                { label: "Actives", value: competitionsActives },
                { label: "Indoor", value: competitionsIndoor },
                { label: "Beach", value: competitionsBeach },
              ]}
            />
            <KpiCard
              title="Matchs"
              value={competitionResults.length}
              icon={CalendarCheck}
              subIndicators={[
                { label: "Joues", value: matchsJoues },
                { label: "Unites", value: competitionUnites.length },
              ]}
            />
            <KpiCard
              title="Transferts"
              value={transferts.length}
              icon={ArrowRightLeft}
              subIndicators={[
                { label: "Valides", value: transfertsValides },
                { label: "En cours", value: transfertsEnCours },
              ]}
            />
            <KpiCard
              title="Selection nationale"
              value={equipeNationale.length}
              icon={Target}
              variant="accent"
              subIndicators={[
                { label: "Masculin", value: selectionMasculins },
                { label: "Feminin", value: selectionFeminins },
                { label: "Suivis", value: equipeNationaleSuivi.length },
              ]}
            />
            <div className="h-full rounded-xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Taux completude
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{tauxCompletude}%</p>
                    <p className="text-xs text-muted-foreground">dossiers complets</p>
                  </div>
                </div>
                <div className="rounded-lg bg-accent/10 p-2.5 text-accent">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={tauxCompletude} className="h-2" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <GenreChart data={genreData} />
          </div>
          <div className="xl:col-span-8">
            <ProvinceChart provinces={provinces} />
          </div>
          <div className="xl:col-span-12">
            <StatsTable provinces={provinces} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
