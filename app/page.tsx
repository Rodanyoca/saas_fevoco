import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { AnalyticsTable, DashboardSection, StatGrid, StatValue } from "@/components/dashboard/analytics"
import { DashboardRefreshButton } from "@/components/dashboard/dashboard-refresh-button"
import { getCompetitionParticipants, getCompetitionResults, getCompetitions, getEquipeNationale, getEquipeNationaleResultats, getEquipeNationaleSelections } from "@/lib/data"
import { loadDashboardDirectory } from "@/lib/dashboard-directory"
import { loadDashboardRecords } from "@/lib/dashboard-records"
import { loadActivities } from "@/lib/activities"
import { loadDocuments } from "@/lib/documents"
import { normalizeMetricValue, isMetricActive, isMetricDone, latestDashboardRows, summarizeDashboardActors } from "@/lib/dashboard-metrics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const safe = async <T,>(promise: Promise<T>, fallback: T) => { try { return await promise } catch { return fallback } }
const statusSummary = <T extends { statut?: string }>(rows: T[]) => { const active = rows.filter((row) => isMetricActive(row.statut)).length; const inactive = rows.filter((row) => isMetricDone(row.statut) || normalizeMetricValue(row.statut).includes("inactif")).length; return { total: rows.length, active, inactive, unknown: rows.length - active - inactive } }
const percent = (value: number, total: number) => total ? Math.round(value * 100 / total) : 0

export default async function DashboardPage() {
  const refreshIso = new Date().toISOString()
  const refreshedAt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium", timeZone: "Africa/Kinshasa" }).format(new Date(refreshIso))
  const [directory, records, competitions, competitionParticipants, competitionResults, nationalTeams, nationalSelections, nationalResults, activityBundle, documentBundle] = await Promise.all([
    loadDashboardDirectory(), loadDashboardRecords(), safe(getCompetitions(), []), safe(getCompetitionParticipants(), []), safe(getCompetitionResults(), []), safe(getEquipeNationale(), []), safe(getEquipeNationaleSelections(), []), safe(getEquipeNationaleResultats(), []), safe(loadActivities(), { activities: [], typeOptions: [] }), safe(loadDocuments({ includeRelations: false }), { documents: [], typeOptions: [] }),
  ])
  const { ligues, ententes, clubs, athletes, coachs, arbitres, medecins, officiels } = directory
  const { affiliations, licenceRows, totalLicences } = records
  const activeAffiliations = affiliations.active
  const inactiveAffiliations = affiliations.inactive
  const structures = [ligues, ententes, clubs]
  const actors = [athletes, coachs, arbitres, officiels, medecins]
  const totalStructures = structures.reduce((sum, rows) => sum + rows.length, 0)
  const totalActors = actors.reduce((sum, rows) => sum + rows.length, 0)
  const actorRows = [["Athlètes", athletes], ["Entraîneurs", coachs], ["Arbitres", arbitres], ["Officiels", officiels], ["Médecins", medecins]].map(([label, source]) => { return { label: String(label), ...summarizeDashboardActors(source as typeof athletes) } })
  const territorialRows = [["Ligues", ligues], ["Ententes", ententes], ["Clubs", clubs]].map(([label, source]) => { const summary = statusSummary(source as Array<{ statut?: string }>); return { label: String(label), ...summary, share: `${percent(summary.total, totalStructures)} %` } })
  const activityRows = latestDashboardRows(activityBundle.activities, (item) => item.startDate).map((item) => ({ id: item.id, label: item.name, type: item.type, date: item.startDate || "—", statut: item.status || "Non renseigné" }))
  const documentRows = latestDashboardRows(documentBundle.documents, (item) => item.documentDate).map((item) => ({ id: item.id, label: item.title, type: item.type, date: item.documentDate || "—", statut: item.status || "Non renseigné" }))

  return <DashboardLayout><Header title="Tableau de bord" subtitle="Référentiel fédéral, structures, acteurs, compétitions et administration" /><main className="flex-1 space-y-8 p-4 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><p className="text-sm text-muted-foreground">Dernière actualisation : <time dateTime={refreshIso} className="font-medium text-foreground">{refreshedAt}</time></p><DashboardRefreshButton /></div>
    <DashboardSection title="Synthèse générale"><StatGrid><StatValue label="Structures territoriales" value={totalStructures.toLocaleString("fr-FR")} detail="Ligues, ententes et clubs" /><StatValue label="Acteurs enregistrés" value={totalActors.toLocaleString("fr-FR")} detail="Toutes les familles d’acteurs" /><StatValue label="Compétitions" value={competitions.length.toLocaleString("fr-FR")} detail={`${competitionParticipants.length} participations enregistrées`} /><StatValue label="Licences" value={totalLicences.toLocaleString("fr-FR")} /><StatValue label="Affiliations" value={affiliations.total.toLocaleString("fr-FR")} detail={`${activeAffiliations} actives · ${inactiveAffiliations} inactives`} /><StatValue label="Résultats de compétitions" value={competitionResults.length.toLocaleString("fr-FR")} /><StatValue label="Équipes nationales" value={nationalTeams.length.toLocaleString("fr-FR")} detail={`${nationalSelections.length} membres sélectionnés`} /><StatValue label="Résultats nationaux" value={nationalResults.length.toLocaleString("fr-FR")} /></StatGrid></DashboardSection>
    <DashboardSection title="Référentiel territorial" description="État des structures enregistrées dans FEVOCO."><AnalyticsTable rows={territorialRows} columns={[{ key: "label", label: "Niveau territorial" }, { key: "total", label: "Total", align: "right" }, { key: "active", label: "Actif", align: "right" }, { key: "inactive", label: "Inactif", align: "right" }, { key: "unknown", label: "Statut non renseigné", align: "right" }, { key: "share", label: "Part du total", align: "right" }]} /></DashboardSection>
    <DashboardSection title="Référentiel des acteurs"><AnalyticsTable rows={actorRows} columns={[{ key: "label", label: "Type d’acteur" }, { key: "total", label: "Total", align: "right" }, { key: "men", label: "Hommes", align: "right" }, { key: "women", label: "Femmes", align: "right" }, { key: "active", label: "Actifs", align: "right" }, { key: "inactive", label: "Autres statuts", align: "right" }]} /></DashboardSection>
    <DashboardSection title="Affiliations"><AnalyticsTable rows={[{ label: "Affiliations", total: affiliations.total, active: activeAffiliations, inactive: inactiveAffiliations }]} columns={[{ key: "label", label: "Type" }, { key: "total", label: "Total", align: "right" }, { key: "active", label: "Actives", align: "right" }, { key: "inactive", label: "Inactives", align: "right" }]} /></DashboardSection>
    <DashboardSection title="Licences" description="Répartition par famille d’acteurs."><AnalyticsTable rows={licenceRows} columns={[{ key: "label", label: "Famille" }, { key: "total", label: "Licences", align: "right" }, { key: "active", label: "Actives", align: "right" }, { key: "expired", label: "Expirées", align: "right" }]} /></DashboardSection>
    <DashboardSection title="Compétitions"><AnalyticsTable rows={[
      { label: "Compétitions enregistrées", total: competitions.length },
      { label: "Compétitions prévues", total: competitions.filter((item) => normalizeMetricValue(item.statutCompetition).includes("planifi")).length },
      { label: "Compétitions terminées", total: competitions.filter((item) => isMetricDone(item.statutCompetition)).length },
      { label: "Participations enregistrées", total: competitionParticipants.length },
      { label: "Résultats enregistrés", total: competitionResults.length },
    ]} columns={[{ key: "label", label: "Indicateur" }, { key: "total", label: "Total", align: "right" }]} /></DashboardSection>
    <DashboardSection title="Équipes nationales"><AnalyticsTable rows={[
      { label: "Équipes nationales", total: nationalTeams.length },
      { label: "Membres sélectionnés", total: nationalSelections.length },
      { label: "Résultats enregistrés", total: nationalResults.length },
    ]} columns={[{ key: "label", label: "Indicateur" }, { key: "total", label: "Total", align: "right" }]} /></DashboardSection>
    <DashboardSection title="Activités récentes"><AnalyticsTable rows={activityRows} columns={[{ key: "label", label: "Activité" }, { key: "type", label: "Type" }, { key: "date", label: "Date" }, { key: "statut", label: "Statut" }]} /></DashboardSection>
    <DashboardSection title="Documents récents"><AnalyticsTable rows={documentRows} columns={[{ key: "label", label: "Document" }, { key: "type", label: "Type" }, { key: "date", label: "Date" }, { key: "statut", label: "Statut" }]} /></DashboardSection>
  </main></DashboardLayout>
}
