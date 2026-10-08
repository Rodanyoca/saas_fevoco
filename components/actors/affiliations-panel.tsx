"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Loader2, Pencil, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { SearchSelect } from "@/components/ui/search-select"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { compactDateFromSheet, formatDateForDisplay } from "@/lib/compact-date"
import type { AffiliationKind } from "@/lib/affiliations-domain"
import { usesEntity, type ActorAffiliationView, type AffiliationOption, type AffiliationReferences } from "@/lib/actor-affiliation-schema"

const emptyRefs: AffiliationReferences = { clubs: [], statuses: [], functions: [], entityTypes: [], entities: {}, seasons: [] }
const blank = () => ({ id_club: "", id_type_entite: "", id_entite: "", id_fonction: "", id_saison: "", date_debut: "", date_fin: "", id_statut_affiliation: "", observations: "" })
type Values = ReturnType<typeof blank>
const labels: Record<AffiliationKind, string> = { athlete: "l’athlète", coach: "l’entraîneur", medecin: "le médecin", officiel: "l’officiel", autre: "l’acteur" }

export function AffiliationsPanel({ kind, actorId, onChanged }: { kind: AffiliationKind; actorId: string; onChanged?: () => Promise<void> }) {
  const router = useRouter(), guard = useRef(false)
  const [items, setItems] = useState<ActorAffiliationView[]>([]), [refs, setRefs] = useState(emptyRefs)
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("")
  const [open, setOpen] = useState(false), [editing, setEditing] = useState<ActorAffiliationView | null>(null), [viewing, setViewing] = useState(false)
  const [values, setValues] = useState(blank), [errors, setErrors] = useState<Record<string, string>>({}), [saving, setSaving] = useState(false)
  const endpoint = `/api/affiliations/${kind}`
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setLoadError("")
    try {
      const response = await fetch(`${endpoint}?actorId=${encodeURIComponent(actorId)}`, { cache: "no-store", signal }), data = await response.json()
      if (!response.ok) throw new Error(data.message || "Lecture impossible.")
      if (!signal?.aborted) { setItems(data.affiliations); setRefs(data.references) }
    } catch (error) { if (!signal?.aborted) setLoadError(error instanceof Error ? error.message : "Lecture impossible.") }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [endpoint, actorId])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])
  const start = (item?: ActorAffiliationView, readOnly = false) => {
    setEditing(item || null); setViewing(readOnly); setErrors({})
    setValues(item ? { id_club: item.clubId, id_type_entite: item.entityTypeId, id_entite: item.entityId, id_fonction: item.functionId, id_saison: item.seasonId || "", date_debut: compactDateFromSheet(item.dateDebut), date_fin: compactDateFromSheet(item.dateFin), id_statut_affiliation: item.statusId, observations: item.observations } : blank())
    setOpen(true)
  }
  const set = (key: keyof Values, value: string) => setValues(current => ({ ...current, [key]: value, ...(key === "id_type_entite" ? { id_entite: "" } : {}) }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (viewing || guard.current) return
    guard.current = true; setSaving(true); setErrors({})
    try {
      const response = await fetch(endpoint, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, actorId, ...(editing ? { id: editing.id } : {}) }) }), data = await response.json()
      if (!response.ok) { setErrors({ ...data.fields, _form: data.message || "Enregistrement impossible." }); return }
      const saved: ActorAffiliationView = data.affiliation
      setItems(current => [saved, ...current.filter(item => item.id !== saved.id)].sort((a, b) => b.dateDebut.localeCompare(a.dateDebut)))
      setOpen(false); toast.success(data.message); router.refresh()
      if (onChanged) { try { await onChanged() } catch { toast.error("Affiliation enregistrée. Actualisez la fiche pour recharger les données liées.") } }
    } catch { setErrors({ _form: "Service temporairement indisponible. Réessayez." }) }
    finally { guard.current = false; setSaving(false) }
  }
  const select = (key: keyof Values, label: string, options: AffiliationOption[], searchable = false) => <div className="space-y-2"><Label htmlFor={`affiliation-${key}`}>{label}</Label>{searchable ? <SearchSelect id={`affiliation-${key}`} value={values[key]} onValueChange={value => set(key, value)} options={options} placeholder="Rechercher une structure" disabled={saving || viewing || !options.length} /> : <Select value={values[key]} onValueChange={value => set(key, value)} disabled={saving || viewing || !options.length}><SelectTrigger className="w-full" id={`affiliation-${key}`} aria-invalid={Boolean(errors[key])}><SelectValue placeholder={options.length ? "Sélectionner" : "Aucune option disponible"} /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select>}{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>
  const headers = usesEntity(kind) ? ["Entité", "Type", ...(kind === "officiel" ? ["Fonction"] : ["Saison"]), "Date de début", "Date de fin", "Statut"] : ["Club", "Date de début", "Date de fin", "Statut"]
  const cells = (item: ActorAffiliationView) => [item.structure || "Structure introuvable", ...(usesEntity(kind) ? [item.entityType || "Non renseigné", kind === "officiel" ? item.fonction || "Non renseignée" : item.saison || "Non renseignée"] : []), formatDateForDisplay(item.dateDebut) || "Non renseignée", item.dateFin ? formatDateForDisplay(item.dateFin) : "En cours", item.statut]
  const actions = (item: ActorAffiliationView) => <div className="flex justify-center gap-1"><Button variant="ghost" size="icon-sm" onClick={() => start(item, true)} aria-label="Consulter l’affiliation"><Eye className="size-4" /></Button><Button variant="ghost" size="icon-sm" onClick={() => start(item)} aria-label="Modifier l’affiliation"><Pencil className="size-4" /></Button></div>
  return <Card className="min-w-0"><CardHeader className="items-start gap-4"><CardTitle>Affiliations</CardTitle><div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} aria-label="Actualiser les affiliations"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></Button><Button className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" onClick={() => start()} disabled={loading || Boolean(loadError)}><Plus className="size-4" />Ajouter une affiliation</Button></div></CardHeader><CardContent>
    {loadError ? <div role="alert" className="rounded-lg border border-destructive/30 p-4"><p>{loadError}</p><Button variant="outline" className="mt-3" onClick={() => void load()}>Réessayer</Button></div> : loading ? <p className="text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" />Chargement…</p> : <>
      {items.some(item => item.anomaly) && <p role="alert" className="mb-4 rounded-lg border border-amber-500/30 p-3 text-sm">Certaines affiliations comportent une référence introuvable. Consultez-les pour vérifier leurs données.</p>}
      {!items.length ? <p className="text-muted-foreground">Aucune affiliation enregistrée.</p> : <><div className="grid gap-3 md:hidden">{items.map(item => <div key={item.id} className="rounded-lg border p-4">{headers.map((header, index) => <div key={header} className="grid grid-cols-2 gap-2 py-1 text-sm"><span className="text-muted-foreground">{header}</span><span className="min-w-0 break-words">{index === headers.length - 1 ? <StatusBadge status={item.statut} /> : cells(item)[index]}</span></div>)}{actions(item)}</div>)}</div><div className="hidden overflow-hidden rounded-lg border md:block"><Table aria-label="Affiliations"><TableHeader className="bg-muted/50"><TableRow>{headers.map(header => <TableHead key={header}>{header}</TableHead>)}<TableHead className="w-20 text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{items.map(item => <TableRow key={item.id}>{cells(item).map((cell, index) => <TableCell key={index} className={index === 0 ? "font-medium" : undefined}>{index === headers.length - 1 ? <StatusBadge status={cell} /> : cell}</TableCell>)}<TableCell className="py-2">{actions(item)}</TableCell></TableRow>)}</TableBody></Table></div></>}
    </>}
  </CardContent><Sheet open={open} onOpenChange={value => { if (!saving) setOpen(value) }}><SheetContent className="w-full overflow-y-auto sm:max-w-md"><form onSubmit={submit} className="flex min-h-full flex-col"><SheetHeader><SheetTitle>{viewing ? "Consulter" : editing ? "Modifier" : "Ajouter"} une affiliation</SheetTitle><SheetDescription>Affiliation de {labels[kind]}. L’identifiant est généré automatiquement.</SheetDescription></SheetHeader><div className="flex-1 space-y-4 px-4 py-2">
    {usesEntity(kind) ? <>{select("id_type_entite", "Type d’entité *", refs.entityTypes)}{select("id_entite", "Entité *", refs.entities[values.id_type_entite] || [], true)}</> : select("id_club", "Club *", refs.clubs, true)}
    {kind === "officiel" && select("id_fonction", "Fonction *", refs.functions)}
    {kind === "autre" && select("id_saison", "Saison *", refs.seasons)}
    {(["date_debut", "date_fin"] as const).map(key => <div key={key} className="space-y-2"><Label htmlFor={`affiliation-${key}`}>{key === "date_debut" ? "Date de début *" : "Date de fin (facultative)"}</Label><CompactDateInput id={`affiliation-${key}`} value={values[key]} onValueChange={value => set(key, value)} required={key === "date_debut"} optional={key === "date_fin"} disabled={saving || viewing} aria-invalid={Boolean(errors[key])} />{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>)}
    {select("id_statut_affiliation", "Statut *", refs.statuses)}
    <div className="space-y-2"><Label htmlFor="affiliation-observations">Observations</Label><Textarea id="affiliation-observations" value={values.observations} onChange={event => set("observations", event.target.value)} disabled={saving || viewing} />{errors.observations && <p className="text-sm text-destructive">{errors.observations}</p>}</div>
    {viewing && editing?.anomaly && <p role="alert" className="text-sm text-amber-600">{editing.anomaly}</p>}
    {errors._form && <p role="alert" className="text-sm text-destructive">{errors._form}</p>}
  </div><SheetFooter>{!viewing && <Button type="submit" className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Enregistrer" : "Créer"}</Button>}<Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>Fermer</Button></SheetFooter></form></SheetContent></Sheet></Card>
}
