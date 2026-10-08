"use client"

import { useMemo, useState } from "react"
import { Ban, Copy, Eye, MoreHorizontal, PauseCircle, Pencil, Plus, RefreshCw, RotateCcw, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ActorLicenceEditor, type ActorLicenceEditorMode } from "@/components/licences/actor-licence-editor"
import { formatDateForDisplay } from "@/lib/compact-date"
import type { ActorLicenceReferences, ActorLicenceView, LicenceOption } from "@/lib/actor-licences-model"

const emptyFilters = { search: "", type: "all", status: "all", cycle: "all", due: "all" }
const statusOptions = ["VALIDE", "A_VENIR", "EXPIREE", "SUSPENDUE", "CLOTUREE", "ANNULEE", "AUTRE", "DATES_INVALIDES"].map(id => ({ id, label: id.replaceAll("_", " ") }))
const columns: Column<ActorLicenceView>[] = [
  { key: "numero", header: "N° licence", className: "font-mono" },
  { key: "acteur", header: "Acteur", render: row => <div><p className="font-medium">{row.acteur}</p><p className="text-xs text-muted-foreground">{row.actorId}</p></div> },
  { key: "type", header: "Type" }, { key: "cycle", header: "Cycle" },
  { key: "dateDelivrance", header: "Délivrée le", render: row => formatDateForDisplay(row.dateDelivrance) || "—" },
  { key: "dateDebut", header: "Début", render: row => formatDateForDisplay(row.dateDebut) || "—" },
  { key: "dateExpiration", header: "Expiration", render: row => <div>{formatDateForDisplay(row.dateExpiration) || "—"}<p className="text-xs text-muted-foreground">{row.remainingDays === null ? "—" : row.remainingDays < 0 ? "Expirée depuis " + Math.abs(row.remainingDays) + " j" : row.remainingDays + " j restant(s)"}</p></div> },
  { key: "statutEffectif", header: "Statut", render: row => <StatusBadge status={row.statutEffectif.replaceAll("_", " ")} /> },
]
export function ActorLicencesClient({ rows, error, references }: { rows: ActorLicenceView[]; error: string; references: ActorLicenceReferences }) {
  const router = useRouter(), [filters, setFilters] = useState(emptyFilters)
  const [editor, setEditor] = useState<{ open: boolean; mode: ActorLicenceEditorMode; licence: ActorLicenceView | null }>({ open: false, mode: "create", licence: null })
  const visible = useMemo(() => rows.filter(row => (!filters.search || [row.id, row.numero, row.actorId, row.acteur].join(" ").toLocaleLowerCase("fr").includes(filters.search.toLocaleLowerCase("fr"))) && (filters.type === "all" || row.typeId === filters.type) && (filters.status === "all" || row.statutEffectif === filters.status) && (filters.cycle === "all" || row.cycleId === filters.cycle) && (filters.due === "all" || row.remainingDays !== null && row.remainingDays >= 0 && row.remainingDays <= Number(filters.due))), [rows, filters])
  if (error) return <Card className="border-destructive/40"><CardContent className="py-10 text-center"><p role="alert" className="text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={() => router.refresh()}><RefreshCw />Réessayer</Button></CardContent></Card>
  const openEditor = (mode: ActorLicenceEditorMode, licence: ActorLicenceView | null = null) => setEditor({ open: true, mode, licence })
  const transition = async (row: ActorLicenceView, action: string, verb: string) => {
    if (!window.confirm(`Confirmer : ${verb} la licence ${row.numero} ?`)) return
    try {
      const response = await fetch("/api/licences/acteurs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id, action }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || "Action impossible.")
      toast.success("Licence mise à jour"); router.refresh()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Service temporairement indisponible.") }
  }
  const filterSelect = (key: "type" | "status" | "cycle" | "due", label: string, options: LicenceOption[]) => <Select value={filters[key]} onValueChange={value => setFilters(old => ({ ...old, [key]: value }))}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{label}</SelectItem>{options.map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>
  const actions = (row: ActorLicenceView) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={"Actions pour la licence " + row.numero}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => openEditor("view", row)}><Eye />Consulter</DropdownMenuItem><DropdownMenuItem onSelect={() => openEditor("edit", row)}><Pencil />Modifier</DropdownMenuItem>{row.dateExpiration && row.statutEffectif !== "ANNULEE" && <DropdownMenuItem onSelect={() => openEditor("renew", row)}><RotateCcw />Renouveler</DropdownMenuItem>}<DropdownMenuItem onSelect={() => { void navigator.clipboard.writeText(row.id) }}><Copy />Copier l’identifiant</DropdownMenuItem>{["VALIDE", "A_VENIR"].includes(row.statutEffectif) && <DropdownMenuItem onSelect={() => void transition(row, "suspend", "suspendre")}><PauseCircle />Suspendre</DropdownMenuItem>}{row.statutEffectif === "SUSPENDUE" && (row.remainingDays ?? -1) >= 0 && <DropdownMenuItem onSelect={() => void transition(row, "reactivate", "réactiver")}><RotateCcw />Réactiver</DropdownMenuItem>}{["VALIDE", "A_VENIR", "SUSPENDUE"].includes(row.statutEffectif) && (row.remainingDays ?? -1) >= 0 && <DropdownMenuItem onSelect={() => void transition(row, "close", "clôturer")}><Ban />Clôturer</DropdownMenuItem>}{row.statutEffectif !== "ANNULEE" && <DropdownMenuItem onSelect={() => void transition(row, "cancel", "annuler")}><XCircle />Annuler</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>
  const due = (from: number, to: number) => visible.filter(row => row.statutEffectif === "VALIDE" && row.remainingDays !== null && row.remainingDays >= from && row.remainingDays <= to).length
  const metrics = [["Total", visible.length], ["Valides aujourd’hui", visible.filter(row => row.statutEffectif === "VALIDE").length], ["À venir", visible.filter(row => row.statutEffectif === "A_VENIR").length], ["Expirées", visible.filter(row => row.statutEffectif === "EXPIREE").length], ["Suspendues", visible.filter(row => row.statutEffectif === "SUSPENDUE").length], ["Expiration ≤ 30 j", due(0, 30)]] as const
  return <div className="space-y-6"><div className="flex flex-wrap justify-end gap-2"><Button className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90" onClick={() => openEditor("create")}><Plus />Enregistrer une licence</Button><Button variant="outline" onClick={() => router.refresh()}><RefreshCw />Actualiser</Button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{metrics.map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></CardContent></Card>)}</div>
    <div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle>Répartition par type</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3">{references.types.map(type => <div className="rounded-lg border p-3" key={type.id}><p className="text-sm text-muted-foreground">{type.label}</p><strong className="text-xl">{visible.filter(row => row.typeId === type.id).length}</strong></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Échéances</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3">{[["0 à 30 jours", 0, 30], ["31 à 60 jours", 31, 60], ["61 à 90 jours", 61, 90]].map(([label, from, to]) => <div className="rounded-lg border p-3" key={label}><p className="text-sm text-muted-foreground">{label}</p><strong className="text-xl">{due(Number(from), Number(to))}</strong></div>)}</CardContent></Card></div>
    <Card><CardHeader><CardTitle>Licences enregistrées</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6"><Input aria-label="Rechercher une licence" value={filters.search} onChange={event => setFilters(old => ({ ...old, search: event.target.value }))} placeholder="Nom, numéro ou identifiant…" />{filterSelect("type", "Tous les types", references.types)}{filterSelect("status", "Tous les statuts", statusOptions)}{filterSelect("cycle", "Tous les cycles", references.cycles)}{filterSelect("due", "Toutes échéances", [{ id: "30", label: "Sous 30 jours" }, { id: "60", label: "Sous 60 jours" }, { id: "90", label: "Sous 90 jours" }])}<Button variant="ghost" onClick={() => setFilters(emptyFilters)}>Réinitialiser</Button></div>
      <DataTable data={visible} columns={columns} idKey="id" searchPlaceholder="Affiner la recherche…" renderActions={actions} renderMobileCard={row => <Card><CardContent className="space-y-2 p-4"><div className="flex justify-between gap-2"><strong>{row.acteur}</strong><StatusBadge status={row.statutEffectif.replaceAll("_", " ")} /></div><p className="text-sm">{row.numero} · {row.type}</p><p className="text-xs text-muted-foreground">{formatDateForDisplay(row.dateDebut)} — {formatDateForDisplay(row.dateExpiration)}</p>{actions(row)}</CardContent></Card>} />
    </CardContent></Card><ActorLicenceEditor open={editor.open} mode={editor.mode} licence={editor.licence} references={references} history={rows.filter(row => row.actorId === editor.licence?.actorId && row.typeId === editor.licence?.typeId)} onOpenChange={open => setEditor(old => ({ ...old, open }))} onSaved={() => router.refresh()} />
  </div>
}
