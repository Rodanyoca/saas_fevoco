"use client"

import { useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { athleteLicenceSummaries, emptyAthleteLicenceSummary } from "@/lib/athlete-licence-metrics"
import type { AthleteLicenceView } from "@/lib/licences-overview"

type Club = { id: string; label: string; ententeId?: string; entente?: string; ligueId?: string; ligue?: string }
const uniqueOptions = (items: [string, string][]) => [...new Map(items.filter(([id]) => id.trim())).entries()]
export function AthleteLicencesClient({ rows, error, creation }: { rows: AthleteLicenceView[]; error: string; creation: { clubs: Club[]; seasons: Array<{id: string; label: string}> } }) {
  const router = useRouter()
  const [season, setSeason] = useState(() => creation.seasons.find(item => item.id.trim() && item.label.startsWith(String(new Date().getFullYear())))?.id || creation.seasons.find(item => item.id.trim())?.id || "all")
  const [ligue, setLigue] = useState("all"), [entente, setEntente] = useState("all"), [club, setClub] = useState("all")
  const seasonRows = useMemo(() => rows.filter(row => season === "all" || row.seasonId === season), [rows, season])
  const { totals, byClub } = useMemo(() => athleteLicenceSummaries(seasonRows), [seasonRows])
  const clubs = useMemo(() => [...new Map([...creation.clubs, ...rows.filter(row => row.clubId).map(row => ({ id: row.clubId, label: row.club, ententeId: row.ententeId, entente: row.entente, ligueId: row.ligueId, ligue: row.ligue }))].filter(item => item.id.trim()).map(item => [item.id, item])).values()], [creation.clubs, rows])
  const ligues = uniqueOptions(clubs.map(item => [item.ligueId || "", item.ligue || item.ligueId || ""]))
  const ententes = uniqueOptions(clubs.filter(item => ligue === "all" || item.ligueId === ligue).map(item => [item.ententeId || "", item.entente || item.ententeId || ""]))
  const clubOptions = clubs.filter(item => (ligue === "all" || item.ligueId === ligue) && (entente === "all" || item.ententeId === entente))
  const visibleClubs = clubOptions.filter(item => club === "all" || item.id === club)
  const picker = (value: string, change: (value: string) => void, label: string, options: [string, string][]) => <Select value={value} onValueChange={change}><SelectTrigger aria-label={label} className="w-full sm:w-48"><SelectValue placeholder={label} /></SelectTrigger><SelectContent><SelectItem value="all">{label}</SelectItem>{uniqueOptions(options).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>
  if (error) return <Card className="border-destructive/40"><CardContent className="py-8 text-center"><p role="alert" className="text-destructive">{error}</p><Button variant="outline" className="mt-3" onClick={() => router.refresh()}><RefreshCw />Réessayer</Button></CardContent></Card>
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">{picker(season, setSeason, "Toutes les saisons", creation.seasons.map(item => [item.id, item.label]))}<div className="flex flex-wrap gap-2"><Button size="icon" variant="outline" aria-label="Actualiser les licences" onClick={() => router.refresh()}><RefreshCw /></Button></div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Total des licences", totals.total], ["Athlètes masculins", totals.hommes], ["Athlètes féminins", totals.femmes], ["Licences actives", totals.actives], ["Expirées / clôturées", totals.nonActives]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Synthèse territoriale</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2">{picker(ligue, value => { setLigue(value); setEntente("all"); setClub("all") }, "Toutes les ligues", ligues)}{picker(entente, value => { setEntente(value); setClub("all") }, "Toutes les ententes", ententes)}{picker(club, setClub, "Tous les clubs", clubOptions.map(item => [item.id, item.label]))}</div><div className="overflow-x-auto rounded-lg border"><Table aria-label="Synthèse territoriale"><TableHeader className="bg-muted/50"><TableRow>{["Club", "Total", "Hommes", "Femmes", "Actives", "Non actives"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{visibleClubs.length ? visibleClubs.map(item => { const stats = byClub.get(item.id) || emptyAthleteLicenceSummary; return <TableRow key={item.id}><TableCell className="font-medium">{item.label}</TableCell>{[stats.total, stats.hommes, stats.femmes, stats.actives, stats.nonActives].map((value, index) => <TableCell key={index}>{value}</TableCell>)}</TableRow> }) : <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun club pour ces filtres.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>

  </div>
}
