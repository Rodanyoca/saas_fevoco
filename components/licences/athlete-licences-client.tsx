"use client"

import { useState } from "react"
import { Eye, Pencil, Plus, RefreshCw, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { AthleteLicenceEditor, type LicenceReferences } from "@/components/licences/athlete-licence-editor"
import { formatDateForDisplay } from "@/lib/compact-date"
import type { AthleteLicenceView } from "@/lib/licences-overview"

type Club = { id: string; label: string; ententeId?: string; entente?: string; ligueId?: string; ligue?: string }
const active = (value: string) => /^(ACTIF|ACTIVE|VALIDE)$/i.test(value.trim())
const male = (value: string) => /^(M|MASCULIN|HOMME)$/i.test(value.trim())
const female = (value: string) => /^(F|FÉMININ|FEMININ|FEMME)$/i.test(value.trim())
const columns: Column<AthleteLicenceView>[] = [
  { key: "numero", header: "N° licence", className: "font-mono" }, { key: "athlete", header: "Athlète", className: "font-medium" },
  { key: "sexe", header: "Sexe" }, { key: "saison", header: "Saison" }, { key: "club", header: "Club" },
  { key: "dateDelivrance", header: "Délivrée le", render: row => formatDateForDisplay(row.dateDelivrance) || "—" },
  { key: "statut", header: "Statut", render: row => <StatusBadge status={row.statut} /> },
]
const uniqueOptions = (items: [string, string][]) => [...new Map(items.filter(([id]) => id.trim())).entries()]
function summary(rows: AthleteLicenceView[]) {
  const values = [...new Map(rows.map(row => [`${row.athleteId}:${row.seasonId}`, row])).values()]
  return { total: values.length, hommes: values.filter(row => male(row.sexe)).length, femmes: values.filter(row => female(row.sexe)).length, actives: values.filter(row => active(row.statut)).length, nonActives: values.filter(row => !active(row.statut)).length }
}
export function AthleteLicencesClient({ rows, error, creation }: { rows: AthleteLicenceView[]; error: string; creation: LicenceReferences & { clubs: Club[] } }) {
  const router = useRouter()
  const [season, setSeason] = useState(() => creation.seasons.find(item => item.id.trim() && item.label.startsWith(String(new Date().getFullYear())))?.id || creation.seasons.find(item => item.id.trim())?.id || "all")
  const [ligue, setLigue] = useState("all"), [entente, setEntente] = useState("all"), [club, setClub] = useState("all")
  const [sex, setSex] = useState("all"), [status, setStatus] = useState("all")
  const [editorOpen, setEditorOpen] = useState(false), [editing, setEditing] = useState<AthleteLicenceView | null>(null)
  const [readOnly, setReadOnly] = useState(false), [mode, setMode] = useState<"ATHLETE" | "CLUB">("ATHLETE")
  const openEditor = (nextMode: "ATHLETE" | "CLUB", item: AthleteLicenceView | null = null, view = false) => { setMode(nextMode); setEditing(item); setReadOnly(view); setEditorOpen(true) }
  const seasonRows = rows.filter(row => season === "all" || row.seasonId === season), totals = summary(seasonRows)
  const clubs = [...new Map([...creation.clubs, ...rows.filter(row => row.clubId).map(row => ({ id: row.clubId, label: row.club, ententeId: row.ententeId, entente: row.entente, ligueId: row.ligueId, ligue: row.ligue }))].filter(item => item.id.trim()).map(item => [item.id, item])).values()]
  const ligues = uniqueOptions(clubs.map(item => [item.ligueId || "", item.ligue || item.ligueId || ""]))
  const ententes = uniqueOptions(clubs.filter(item => ligue === "all" || item.ligueId === ligue).map(item => [item.ententeId || "", item.entente || item.ententeId || ""]))
  const clubOptions = clubs.filter(item => (ligue === "all" || item.ligueId === ligue) && (entente === "all" || item.ententeId === entente))
  const visibleClubs = clubOptions.filter(item => club === "all" || item.id === club)
  const visible = seasonRows.filter(row => (ligue === "all" || row.ligueId === ligue) && (entente === "all" || row.ententeId === entente) && (club === "all" || row.clubId === club) && (sex === "all" || row.sexId === sex) && (status === "all" || row.statusId === status))
  const picker = (value: string, change: (value: string) => void, label: string, options: [string, string][]) => <Select value={value} onValueChange={change}><SelectTrigger aria-label={label} className="w-full sm:w-48"><SelectValue placeholder={label} /></SelectTrigger><SelectContent><SelectItem value="all">{label}</SelectItem>{uniqueOptions(options).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>
  const actions = (item: AthleteLicenceView) => <div className="flex gap-1"><Button size="icon-sm" variant="ghost" aria-label={`Consulter la licence ${item.numero}`} onClick={() => openEditor("ATHLETE", item, true)}><Eye /></Button><Button size="icon-sm" variant="ghost" aria-label={`Modifier la licence ${item.numero}`} onClick={() => openEditor("ATHLETE", item)}><Pencil /></Button></div>
  if (error) return <Card className="border-destructive/40"><CardContent className="py-8 text-center"><p role="alert" className="text-destructive">{error}</p><Button variant="outline" className="mt-3" onClick={() => router.refresh()}><RefreshCw />Réessayer</Button></CardContent></Card>
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">{picker(season, setSeason, "Toutes les saisons", creation.seasons.map(item => [item.id, item.label]))}<div className="flex flex-wrap gap-2"><Button className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" onClick={() => openEditor("ATHLETE")}><Plus />Enregistrer une licence</Button><Button variant="outline" onClick={() => openEditor("CLUB")}><Users />Renouveler par club</Button><Button size="icon" variant="outline" aria-label="Actualiser les licences" onClick={() => router.refresh()}><RefreshCw /></Button></div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Total des licences", totals.total], ["Athlètes masculins", totals.hommes], ["Athlètes féminins", totals.femmes], ["Licences actives", totals.actives], ["Expirées / clôturées", totals.nonActives]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Synthèse territoriale</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2">{picker(ligue, value => { setLigue(value); setEntente("all"); setClub("all") }, "Toutes les ligues", ligues)}{picker(entente, value => { setEntente(value); setClub("all") }, "Toutes les ententes", ententes)}{picker(club, setClub, "Tous les clubs", clubOptions.map(item => [item.id, item.label]))}</div><div className="overflow-hidden rounded-lg border"><Table aria-label="Synthèse territoriale"><TableHeader className="bg-muted/50"><TableRow>{["Club", "Total", "Hommes", "Femmes", "Actives", "Non actives"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{visibleClubs.length ? visibleClubs.map(item => { const stats = summary(seasonRows.filter(row => row.clubId === item.id)); return <TableRow key={item.id}><TableCell className="font-medium">{item.label}</TableCell>{[stats.total, stats.hommes, stats.femmes, stats.actives, stats.nonActives].map((value, index) => <TableCell key={index}>{value}</TableCell>)}</TableRow> }) : <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun club pour ces filtres.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Licences enregistrées</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2">{picker(sex, setSex, "Tous les sexes", rows.map(row => [row.sexId, row.sexe]))}{picker(status, setStatus, "Tous les statuts", creation.statuses.map(item => [item.id, item.label]))}</div><DataTable data={visible} columns={columns} idKey="id" searchPlaceholder="Nom, identifiant ou numéro de licence…" renderActions={actions} renderMobileCard={item => <Card><CardContent className="space-y-2 p-4"><div className="flex items-start justify-between gap-2"><strong>{item.athlete}</strong><StatusBadge status={item.statut} /></div><p className="break-words text-sm">{item.numero} · {item.club}</p><p className="text-xs text-muted-foreground">{item.ligue} · {formatDateForDisplay(item.dateDelivrance)}</p>{actions(item)}</CardContent></Card>} /></CardContent></Card>
    <AthleteLicenceEditor open={editorOpen} onOpenChange={setEditorOpen} references={creation} rows={rows} editing={editing} readOnly={readOnly} mode={mode} initialSeason={season === "all" ? creation.seasons.find(item => item.id.trim())?.id || "" : season} onSaved={() => router.refresh()} />
  </div>
}
