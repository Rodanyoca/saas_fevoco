import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getArbitres,
  getAthletes,
  getClubs,
  getCoachs,
  getCompetitionClassements,
  getCompetitionParticipants,
  getCompetitionResults,
  getCompetitions,
  getCompetitionUnites,
  getDerniereMiseAJour,
  getEntentes,
  getEquipeNationale,
  getEquipeNationaleCompetitions,
  getEquipeNationaleParticipantsCount,
  getEquipeNationaleResultats,
  getEquipeNationaleSelections,
  getLigues,
  getMedecins,
  getOfficiels,
  getProvinces,
} from "@/lib/data"
import { formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import { createQualityStats } from "@/lib/quality"

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

function isPlanned(value: string | null | undefined): boolean {
  const normalized = normalizeValue(value)
  return normalized.includes("prevu") || normalized.includes("programme") || normalized.includes("planifie")
}

function isDone(value: string | null | undefined): boolean {
  const normalized = normalizeValue(value)
  return normalized.includes("termine") || normalized.includes("cloture") || normalized.includes("complete")
}

function isWin(value: string | null | undefined): boolean {
  const normalized = normalizeValue(value)
  return normalized.startsWith("v") || normalized.includes("gagne")
}

function getHealth(rate: number) {
  if (rate >= 80) return { label: "Bonne", className: "bg-green-100 text-green-800" }
  if (rate >= 60) return { label: "A surveiller", className: "bg-amber-100 text-amber-800" }
  return { label: "Critique", className: "bg-red-100 text-red-800" }
}

function getAlertBadge(count: number) {
  if (count === 0) return { label: "OK", className: "bg-green-100 text-green-800" }
  if (count <= 5) return { label: "A verifier", className: "bg-amber-100 text-amber-800" }
  return { label: "A completer", className: "bg-red-100 text-red-800" }
}

function CompactSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>
    </Card>
  )
}

function MetricGrid({
  items,
}: {
  items: Array<{ label: string; value: string | number; note?: string }>
}) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 border-b border-border/50 pb-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 break-words text-xs leading-tight text-muted-foreground">{item.label}</span>
            <span className="shrink-0 text-base font-semibold">{item.value}</span>
          </div>
          {item.note && <p className="break-words text-[11px] leading-tight text-muted-foreground">{item.note}</p>}
        </div>
      ))}
    </div>
  )
}

function CompactResults({
  rows,
}: {
  rows: Array<{ id: string; left: string; middle: string; right: string }>
}) {
  return (
    <div className="mt-3 space-y-1">
      {rows.map((row) => (
        <div key={row.id} className="grid min-w-0 gap-2 border-b border-border/50 pb-1 text-sm md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto]">
          <span className="min-w-0 break-words font-medium leading-snug">{row.left || "-"}</span>
          <span className="min-w-0 break-words leading-snug text-muted-foreground">{row.middle || "-"}</span>
          <span className="font-mono font-medium md:text-right">{row.right || "-"}</span>
        </div>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const [
    derniereMiseAJour,
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
    competitionParticipants,
    competitionUnites,
    competitionResults,
    competitionClassements,
    equipeNationale,
    equipeNationaleSelections,
    equipeNationaleCompetitions,
    equipeNationaleParticipantsCount,
    equipeNationaleResultats,
  ] = await Promise.all([
    getDerniereMiseAJour(),
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
    getCompetitionParticipants(),
    getCompetitionUnites(),
    getCompetitionResults(),
    getCompetitionClassements(),
    getEquipeNationale(),
    getEquipeNationaleSelections(),
    getEquipeNationaleCompetitions(),
    getEquipeNationaleParticipantsCount(),
    getEquipeNationaleResultats(),
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
    competitionParticipants,
    competitionUnites,
    competitionResults,
    competitionClassements,
    equipeNationale,
    equipeNationaleSelections,
    equipeNationaleCompetitions,
    equipeNationaleResultats,
  })
  const totalRecords = qualityStats.reduce((acc, stat) => acc + stat.total, 0)
  const totalCompleteRecords = qualityStats.reduce((acc, stat) => acc + stat.complets, 0)
  const tauxCompletude = totalRecords ? Math.round((totalCompleteRecords / totalRecords) * 100) : 0
  const health = getHealth(tauxCompletude)

  const clubsActifs = clubs.filter((club) => isActive(club.statut)).length
  const clubsSansStatut = clubs.filter((club) => !club.statut).length
  const athletesSansClub = athletes.filter((athlete) => !athlete.clubId && !athlete.clubNom).length
  const athletesIncomplets = athletes.filter((athlete) => !athlete.id || !athlete.nomComplet || !athlete.genre || !athlete.clubNom).length
  const athleteIndoor = athletes.filter((athlete) => normalizeValue(athlete.disciplineActive) === "indoor").length
  const athleteBeach = athletes.filter((athlete) => normalizeValue(athlete.disciplineActive) === "beach").length
  const athleteMixte = athletes.filter((athlete) => {
    const discipline = normalizeValue(athlete.disciplineActive)
    return discipline.includes("indoor") && discipline.includes("beach")
  }).length
  const athletesMasculins = athletes.filter((athlete) => normalizeValue(athlete.genre) === "m").length
  const athletesFeminins = athletes.filter((athlete) => normalizeValue(athlete.genre) === "f").length

  const competitionsPrevues = competitions.filter((competition) => isPlanned(competition.statut)).length
  const competitionsEnCours = competitions.filter((competition) => isActive(competition.statut)).length
  const competitionsTerminees = competitions.filter((competition) => isDone(competition.statut)).length
  const competitionIdsWithUnits = new Set(competitionUnites.map((unite) => unite.idCompetition).filter(Boolean))
  const competitionsSansUnites = competitions.filter((competition) => !competitionIdsWithUnits.has(competition.id)).length
  const classementResultIds = new Set(competitionClassements.map((row) => row.idResultat).filter(Boolean))
  const resultatsSansClassement = competitionResults.filter((result) => result.idResultat && !classementResultIds.has(result.idResultat)).length
  const derniersResultats = [...competitionResults]
    .sort((a, b) => (parseSheetDate(b.dateMatch)?.getTime() ?? 0) - (parseSheetDate(a.dateMatch)?.getTime() ?? 0))
    .slice(0, 4)

  const equipesNationalesActives = equipeNationale.filter((equipe) => isActive(equipe.statutEquipe)).length
  const selectionTeamIds = new Set(equipeNationaleSelections.map((selection) => selection.idEquipeNationale).filter(Boolean))
  const equipesSansSelection = equipeNationale.filter((equipe) => !selectionTeamIds.has(equipe.idEquipeNationale)).length
  const resultatsEquipeNationaleIncomplets = equipeNationaleResultats.filter(
    (resultat) => !resultat.scoreGlobal || !resultat.resultatMatch,
  ).length
  const derniersResultatsEN = [...equipeNationaleResultats]
    .sort((a, b) => (parseSheetDate(b.dateMatch)?.getTime() ?? 0) - (parseSheetDate(a.dateMatch)?.getTime() ?? 0))
    .slice(0, 4)

  const topLigues = ligues
    .map((ligue) => ({
      id: ligue.id,
      nom: ligue.nom,
      clubs: clubs.filter((club) => club.ligueId === ligue.id || club.ligueNom === ligue.nom).length,
    }))
    .sort((a, b) => b.clubs - a.clubs)
    .slice(0, 5)

  const alerts = [
    { label: "Athletes sans club", count: athletesSansClub },
    { label: "Fiches athletes incompletes", count: athletesIncomplets },
    { label: "Clubs sans statut", count: clubsSansStatut },
    { label: "Competitions sans unites", count: competitionsSansUnites },
    { label: "Resultats sans classement", count: resultatsSansClassement },
    { label: "Equipes nationales sans selection", count: equipesSansSelection },
    { label: "Resultats EN incomplets", count: resultatsEquipeNationaleIncomplets },
  ]

  return (
    <DashboardLayout>
      <Header
        title="Tableau de bord FEVOCO"
        subtitle={`Pilotage federal${derniereMiseAJour ? ` - Derniere mise a jour : ${derniereMiseAJour}` : ""}`}
      />

      <div className="space-y-4 p-4">
        <CompactSection title="Vue generale">
          <MetricGrid
            items={[
              { label: "Clubs", value: clubs.length },
              { label: "Athletes", value: athletes.length },
              { label: "Competitions", value: competitions.length },
              { label: "Equipes nationales", value: equipeNationale.length },
              { label: "Derniere mise a jour", value: derniereMiseAJour || "-" },
              { label: "Sante donnees", value: health.label, note: `${tauxCompletude}% completude` },
            ]}
          />
        </CompactSection>

        <div className="grid gap-4 xl:grid-cols-2">
          <CompactSection title="Structure territoriale">
            <MetricGrid
              items={[
                { label: "Provinces", value: provinces.length },
                { label: "Ligues", value: ligues.length },
                { label: "Ententes", value: ententes.length },
                { label: "Clubs", value: clubs.length },
                { label: "Clubs actifs", value: clubsActifs },
              ]}
            />
            <div className="mt-3 grid gap-2">
              {topLigues.map((ligue) => (
                <div key={ligue.id || ligue.nom} className="flex items-center justify-between text-sm">
                  <span className="truncate text-muted-foreground">{ligue.nom || "-"}</span>
                  <span className="font-medium">{ligue.clubs}</span>
                </div>
              ))}
            </div>
          </CompactSection>

          <CompactSection title="Acteurs">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Effectifs</p>
            <MetricGrid
              items={[
                { label: "Athletes", value: athletes.length },
                { label: "Coachs", value: coachs.length },
                { label: "Officiels", value: officiels.length },
                { label: "Arbitres", value: arbitres.length },
                { label: "Medecins", value: medecins.length },
              ]}
            />
            <p className="mb-2 mt-3 text-xs font-medium text-muted-foreground">Repartition athletes</p>
            <MetricGrid
              items={[
                { label: "Indoor", value: athleteIndoor },
                { label: "Beach", value: athleteBeach },
                { label: "Indoor/Beach", value: athleteMixte },
                { label: "Masculin", value: athletesMasculins },
                { label: "Feminin", value: athletesFeminins },
                { label: "Sans club", value: athletesSansClub },
              ]}
            />
          </CompactSection>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <CompactSection title="Competitions">
            <MetricGrid
              items={[
                { label: "Total", value: competitions.length },
                { label: "Prevues", value: competitionsPrevues },
                { label: "En cours", value: competitionsEnCours },
                { label: "Terminees", value: competitionsTerminees },
                { label: "Participants", value: competitionParticipants.length },
                { label: "Unites", value: competitionUnites.length },
                { label: "Matchs", value: competitionResults.length },
                { label: "Resultats hors classement", value: resultatsSansClassement },
                { label: "Sans unites", value: competitionsSansUnites },
              ]}
            />
            <p className="mt-3 text-xs font-medium text-muted-foreground">Derniers resultats</p>
            <CompactResults
              rows={derniersResultats.map((resultat) => ({
                id: resultat.idResultat,
                left: resultat.nomCompetition || "-",
                middle: `${resultat.nomUniteA || "-"} / ${resultat.nomUniteB || "-"}`,
                right: resultat.scoreGlobal || "-",
              }))}
            />
          </CompactSection>

          <CompactSection title="Equipes nationales">
            <MetricGrid
              items={[
                { label: "Equipes", value: equipeNationale.length },
                { label: "Actives", value: equipesNationalesActives },
                { label: "Selections", value: equipeNationaleSelections.length },
                { label: "Participations", value: equipeNationaleParticipantsCount },
                { label: "Resultats", value: equipeNationaleResultats.length },
                { label: "Sans selection", value: equipesSansSelection },
                { label: "Resultats incomplets", value: resultatsEquipeNationaleIncomplets },
              ]}
            />
            <p className="mt-3 text-xs font-medium text-muted-foreground">Derniers resultats Leopards</p>
            <CompactResults
              rows={derniersResultatsEN.map((resultat) => ({
                id: resultat.idResultatEn,
                left: `${formatSheetDate(resultat.dateMatch)} - ${resultat.nomEquipeNationale || "-"}`,
                middle: resultat.adversaire || "-",
                right: `${resultat.scoreGlobal || "-"}${isWin(resultat.resultatMatch) ? " V" : ""}`,
              }))}
            />
          </CompactSection>
        </div>

        <CompactSection title="Alertes">
          <div className="grid min-w-0 gap-x-4 gap-y-2 md:grid-cols-2 xl:grid-cols-4">
            {alerts.map((alert) => {
              const badge = getAlertBadge(alert.count)
              return (
                <div key={alert.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/50 pb-1 text-sm">
                  <span className="min-w-0 break-words leading-snug text-muted-foreground">{alert.label}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-medium">{alert.count}</span>
                    <Badge className={`${badge.className} max-w-[6.5rem] whitespace-normal text-center leading-tight`}>{badge.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CompactSection>
      </div>
    </DashboardLayout>
  )
}
