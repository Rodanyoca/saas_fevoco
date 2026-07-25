import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"
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
  getEquipeNationaleResultats,
  getEquipeNationaleSelections,
  getEquipeNationaleStaff,
  getLigues,
  getMedecins,
  getOfficiels,
  getProvinces,
} from "@/lib/data"
import {
  getArbitreLicences,
  getAthleteAffiliations,
  getAthleteLicences,
  getCoachAffiliations,
  getCoachLicences,
  getMedecinAffiliations,
  getMedecinLicences,
  getOfficielAffiliations,
  getOfficielLicences,
} from "@/lib/actor-records"
import { formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import {
  calculateActorMetrics,
  calculateLicenceMetrics,
  calculateTerritorialMetrics,
  completionPercent,
  isDateExpired,
  isMetricActive,
  isMetricDone,
  isMetricPlanned,
  isMetricWin,
  normalizeMetricValue,
} from "@/lib/dashboard-metrics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch {
    return fallback
  }
}

const normalizeValue = normalizeMetricValue
const isActive = isMetricActive
const isPlanned = isMetricPlanned
const isDone = isMetricDone
const isWin = isMetricWin
const isExpired = isDateExpired
const percent = completionPercent

function CompactSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>
    </Card>
  )
}

function DashboardKpi({
  label, value, href,
}: {
  label: string
  value: number
  href: string
}) {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <Link href={href} className="text-xs font-medium text-primary hover:underline">Voir le module</Link>
        </div>
      </CardContent>
    </Card>
  )
}

function QualityMetric({ label, value, total }: { label: string; value: number; total: number }) {
  const completion = percent(value, total)
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{completion}% · {value}/{total}</span>
    </div>
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
    equipeNationaleStaff,
    equipeNationaleCompetitions,
    equipeNationaleResultats,
    athleteAffiliations,
    coachAffiliations,
    medecinAffiliations,
    officielAffiliations,
    athleteLicences,
    coachLicences,
    arbitreLicences,
    medecinLicences,
    officielLicences,
  ] = await Promise.all([
    safe(getDerniereMiseAJour(), ""),
    safe(getProvinces(), []),
    safe(getLigues(), []),
    safe(getEntentes(), []),
    safe(getClubs(), []),
    safe(getAthletes(), []),
    safe(getCoachs(), []),
    safe(getArbitres(), []),
    safe(getMedecins(), []),
    safe(getOfficiels(), []),
    safe(getCompetitions(), []),
    safe(getCompetitionParticipants(), []),
    safe(getCompetitionUnites(), []),
    safe(getCompetitionResults(), []),
    safe(getCompetitionClassements(), []),
    safe(getEquipeNationale(), []),
    safe(getEquipeNationaleSelections(), []),
    safe(getEquipeNationaleStaff(), []),
    safe(getEquipeNationaleCompetitions(), []),
    safe(getEquipeNationaleResultats(), []),
    safe(getAthleteAffiliations(), []),
    safe(getCoachAffiliations(), []),
    safe(getMedecinAffiliations(), []),
    safe(getOfficielAffiliations(), []),
    safe(getAthleteLicences(), []),
    safe(getCoachLicences(), []),
    safe(getArbitreLicences(), []),
    safe(getMedecinLicences(), []),
    safe(getOfficielLicences(), []),
  ])
  const territorialMetrics = calculateTerritorialMetrics(provinces, ligues, ententes, clubs)
  const actorMetrics = calculateActorMetrics(athletes, coachs, arbitres, medecins, officiels)

  const clubsActifs = clubs.filter((club) => isActive(club.statut)).length
  const liguesActives = ligues.filter((ligue) => isActive(ligue.statut)).length
  const ententesActives = ententes.filter((entente) => isActive(entente.statut)).length
  const clubsSansLigue = clubs.filter((club) => !club.ligueId && !club.ligueNom).length
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
  const athletesActifs = athletes.filter((athlete) => isActive(athlete.statut)).length
  const athletesAvecAvatar = athletes.filter((athlete) => athlete.avatarDriveId || athlete.avatarDriveUrl).length
  const athletesAvecIdNational = athletes.filter((athlete) => athlete.idNational).length
  const athletesAvecContact = athletes.filter((athlete) => athlete.telephone && athlete.email && athlete.adresse).length
  const coachsAvecContact = coachs.filter((item) => item.telephone && item.email && item.adresse).length
  const arbitresAvecContact = arbitres.filter((item) => item.telephone && item.email && item.adresse).length
  const medecinsAvecContact = medecins.filter((item) => item.telephone && item.email && item.adresse).length
  const officielsAvecContact = officiels.filter((item) => item.telephone && item.email && item.adresse).length
  const topClubsAthletes = Array.from(
    athletes.reduce((rows, athlete) => {
      const key = athlete.clubId || athlete.clubNom
      if (!key) return rows
      const current = rows.get(key) ?? { nom: athlete.clubNom || key, count: 0 }
      current.count += 1
      rows.set(key, current)
      return rows
    }, new Map<string, { nom: string; count: number }>()).values(),
  ).sort((a, b) => b.count - a.count).slice(0, 5)

  const allAffiliations = [...athleteAffiliations, ...coachAffiliations, ...medecinAffiliations, ...officielAffiliations]
  const allLicences = [...athleteLicences, ...coachLicences, ...arbitreLicences, ...medecinLicences, ...officielLicences]
  const licenceMetrics = calculateLicenceMetrics(allLicences)
  const affiliationsActives = allAffiliations.filter((item) => isActive(item.statutAffiliation)).length
  const affiliationsCloturees = allAffiliations.filter((item) => isDone(item.statutAffiliation) || isExpired(item.dateFin)).length
  const affiliationsSansDateFin = allAffiliations.filter((item) => !item.dateFin).length
  const licencesExpirees = licenceMetrics.expired
  const licencesActives = licenceMetrics.active
  const renouvellementLimit = Date.now() + 30 * 24 * 60 * 60 * 1000
  const licencesARenouveler = allLicences.filter((item) => {
    const date = parseSheetDate(item.dateFinValidite)?.getTime()
    return date !== undefined && date >= Date.now() && date <= renouvellementLimit
  }).length

  const competitionsPrevues = competitions.filter((competition) => isPlanned(competition.statutCompetition)).length
  const competitionsEnCours = competitions.filter((competition) => isActive(competition.statutCompetition)).length
  const competitionsTerminees = competitions.filter((competition) => isDone(competition.statutCompetition)).length
  const competitionIdsWithUnits = new Set(competitionUnites.map((unite) => unite.idCompetition).filter(Boolean))
  const competitionsSansUnites = competitions.filter((competition) => !competitionIdsWithUnits.has(competition.idCompetition)).length
  const classementResultIds = new Set(competitionClassements.map((row) => row.idResultat).filter(Boolean))
  const resultatsSansClassement = competitionResults.filter((result) => result.idResultat && !classementResultIds.has(result.idResultat)).length
  const competitionIdsWithParticipants = new Set(competitionParticipants.map((item) => item.idCompetition))
  const competitionsSansParticipants = competitions.filter((item) => !competitionIdsWithParticipants.has(item.idCompetition)).length
  const matchsTerminesSansScore = competitionResults.filter((item) => isDone(item.statutMatch) && !item.scoreGlobal).length
  const derniersResultats = [...competitionResults]
    .sort((a, b) => (parseSheetDate(b.dateMatch)?.getTime() ?? 0) - (parseSheetDate(a.dateMatch)?.getTime() ?? 0))
    .slice(0, 4)

  const equipesNationalesActives = equipeNationale.filter((equipe) => isActive(equipe.statutEquipe)).length
  const selectionTeamIds = new Set(equipeNationaleSelections.map((selection) => selection.idEquipeNationale).filter(Boolean))
  const equipesSansSelection = equipeNationale.filter((equipe) => !selectionTeamIds.has(equipe.idEquipeNationale)).length
  const staffTeamIds = new Set(equipeNationaleStaff.map((item) => item.idEquipeNationale))
  const equipesSansStaff = equipeNationale.filter((item) => !staffTeamIds.has(item.idEquipeNationale)).length
  const resultatsEquipeNationaleIncomplets = equipeNationaleResultats.filter(
    (resultat) => !resultat.scoreGlobal || !resultat.resultatMatch,
  ).length
  const derniersResultatsEN = [...equipeNationaleResultats]
    .sort((a, b) => (parseSheetDate(b.dateMatch)?.getTime() ?? 0) - (parseSheetDate(a.dateMatch)?.getTime() ?? 0))
    .slice(0, 4)
  const victoiresEN = equipeNationaleResultats.filter((resultat) => isWin(resultat.resultatMatch)).length
  const defaitesEN = equipeNationaleResultats.filter((resultat) => normalizeValue(resultat.resultatMatch).includes("defaite")).length

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
    { label: "Clubs sans ligue", count: clubsSansLigue },
    { label: "Affiliations sans date de fin", count: affiliationsSansDateFin },
    { label: "Licences expirées", count: licencesExpirees },
    { label: "Compétitions sans participants", count: competitionsSansParticipants },
    { label: "Matchs terminés sans score", count: matchsTerminesSansScore },
    { label: "Competitions sans unites", count: competitionsSansUnites },
    { label: "Resultats sans classement", count: resultatsSansClassement },
    { label: "Equipes nationales sans selection", count: equipesSansSelection },
    { label: "Équipes nationales sans staff", count: equipesSansStaff },
    { label: "Resultats EN incomplets", count: resultatsEquipeNationaleIncomplets },
  ]

  return (
    <DashboardLayout>
      <Header
        title="Tableau de bord FEVOCO"
        subtitle={`Pilotage federal${derniereMiseAJour ? ` - Derniere mise a jour : ${derniereMiseAJour}` : ""}`}
      />

      <div className="space-y-4 p-4">
        <div className="flex justify-end">
          <DashboardRefreshButton />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <DashboardKpi label="Ligues" value={territorialMetrics.ligues} href="/ligues" />
          <DashboardKpi label="Ententes" value={territorialMetrics.ententes} href="/ententes" />
          <DashboardKpi label="Clubs" value={territorialMetrics.clubs} href="/clubs" />
          <DashboardKpi label="Athlètes" value={actorMetrics.athletes} href="/athletes" />
          <DashboardKpi label="Encadreurs" value={actorMetrics.encadreurs} href="/coachs" />
          <DashboardKpi label="Compétitions" value={competitions.length} href="/competitions" />
          <DashboardKpi label="Équipes nationales" value={equipeNationale.length} href="/equipe-nationale" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <CompactSection title="Structure territoriale">
            <MetricGrid
              items={[
                { label: "Provinces", value: provinces.length },
                { label: "Ligues", value: ligues.length },
                { label: "Ententes", value: ententes.length },
                { label: "Clubs", value: clubs.length },
                { label: "Clubs actifs", value: clubsActifs },
                { label: "Ligues actives", value: liguesActives },
                { label: "Ententes actives", value: ententesActives },
                { label: "Clubs sans ligue", value: clubsSansLigue },
                { label: "Moy. clubs / ligue", value: territorialMetrics.averageClubsPerLeague.toFixed(1) },
                { label: "Moy. ententes / ligue", value: territorialMetrics.averageEntentesPerLeague.toFixed(1) },
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
                { label: "Actifs", value: athletesActifs },
                { label: "Avec avatar", value: athletesAvecAvatar },
                { label: "Avec ID national", value: athletesAvecIdNational },
              ]}
            />
            <p className="mb-2 mt-3 text-xs font-medium text-muted-foreground">Clubs avec le plus d’athlètes</p>
            {topClubsAthletes.map((club) => <div key={club.nom} className="flex justify-between border-b py-1 text-sm"><span className="text-muted-foreground">{club.nom}</span><span className="font-medium">{club.count}</span></div>)}
            <p className="mb-2 mt-3 text-xs font-medium text-muted-foreground">Coordonnées complètes</p>
            <MetricGrid items={[
              { label: "Coachs", value: `${coachsAvecContact}/${coachs.length}` },
              { label: "Arbitres", value: `${arbitresAvecContact}/${arbitres.length}` },
              { label: "Médecins", value: `${medecinsAvecContact}/${medecins.length}` },
              { label: "Officiels", value: `${officielsAvecContact}/${officiels.length}` },
            ]} />
          </CompactSection>
        </div>

        <CompactSection title="Affiliations et licences">
          <MetricGrid items={[
            { label: "Affiliations actives", value: affiliationsActives },
            { label: "Affiliations clôturées", value: affiliationsCloturees },
            { label: "Affiliations sans fin", value: affiliationsSansDateFin },
            { label: "Licences actives", value: licencesActives },
            { label: "Licences expirées", value: licencesExpirees },
            { label: "À renouveler sous 30 jours", value: licencesARenouveler },
            { label: "Transferts enregistrés", value: athleteAffiliations.filter((item) => normalizeValue(item.typeAffiliation).includes("transfert")).length },
          ]} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Athlètes", athleteLicences.length], ["Coachs", coachLicences.length],
              ["Arbitres", arbitreLicences.length], ["Médecins", medecinLicences.length],
              ["Officiels", officielLicences.length],
            ].map(([label, value]) => <div key={String(label)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}
          </div>
        </CompactSection>

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
                { label: "Staff", value: equipeNationaleStaff.length },
                { label: "Compétitions", value: equipeNationaleCompetitions.length },
                { label: "Resultats", value: equipeNationaleResultats.length },
                { label: "Victoires", value: victoiresEN },
                { label: "Défaites", value: defaitesEN },
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

        <div className="grid gap-4 xl:grid-cols-2">
          <CompactSection title="Qualité et complétude des données">
            <div className="space-y-4">
              <QualityMetric label="Athlètes avec identité nationale" value={athletesAvecIdNational} total={athletes.length} />
              <QualityMetric label="Athlètes avec contacts complets" value={athletesAvecContact} total={athletes.length} />
              <QualityMetric label="Athlètes avec avatar" value={athletesAvecAvatar} total={athletes.length} />
              <QualityMetric label="Athlètes avec club" value={athletes.length - athletesSansClub} total={athletes.length} />
              <QualityMetric label="Athlètes avec licence" value={new Set(athleteLicences.map((item) => item.actorId)).size} total={athletes.length} />
            </div>
          </CompactSection>

          <CompactSection title="Points d’attention">
          <div className="grid min-w-0 gap-x-4 gap-y-2 md:grid-cols-2 xl:grid-cols-4">
            {alerts.map((alert) => (
                <div key={alert.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/50 pb-1 text-sm">
                  <span className="min-w-0 break-words leading-snug text-muted-foreground">{alert.label}</span>
                  <span className="font-medium">{alert.count}</span>
                </div>
            ))}
          </div>
          </CompactSection>
        </div>

        <CompactSection title="Activité récente">
          <p className="text-sm text-muted-foreground">
            Aucun journal d’activité horodaté n’est disponible dans les classeurs connectés.
          </p>
        </CompactSection>
      </div>
    </DashboardLayout>
  )
}
