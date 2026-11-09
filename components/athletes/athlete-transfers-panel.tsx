"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Plus, RefreshCw, Undo2 } from "lucide-react"
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
import { compactDateFromSheet, formatDateForDisplay } from "@/lib/compact-date"
import type { ActorAffiliationView, AffiliationReferences } from "@/lib/actor-affiliation-schema"

const blank = () => ({ id_club: "", id_type_transfert: "", id_affiliation_precedente: "", date_debut: "", date_fin: "", id_statut_affiliation: "SAF001", observations: "" })
type Values = ReturnType<typeof blank>
const emptyRefs: AffiliationReferences = { clubs: [], statuses: [], functions: [], entityTypes: [], entities: {}, seasons: [] }
export function AthleteTransfersPanel({ actorId, onChanged }: { actorId: string; onChanged?: () => Promise<void> }) {
  const router = useRouter(), controller = useRef<AbortController | null>(null), savingGuard = useRef(false)
  const [items, setItems] = useState<ActorAffiliationView[]>([]), [refs, setRefs] = useState(emptyRefs)
  const [loading, setLoading] = useState(true), [error, setError] = useState("")
  const [open, setOpen] = useState(false), [editing, setEditing] = useState<ActorAffiliationView | null>(null), [viewing, setViewing] = useState(false), [returning, setReturning] = useState(false)
  const [values, setValues] = useState(blank), [errors, setErrors] = useState<Record<string, string>>({}), [saving, setSaving] = useState(false), [uncertain, setUncertain] = useState(false)
  const key = useRef(""), payload = useRef<string | null>(null)
  const endpoint = `/api/affiliations/athlete?actorId=${encodeURIComponent(actorId)}`
  const load = useCallback(async () => {
    controller.current?.abort(); const request = new AbortController(); controller.current = request
    setLoading(true); setError("")
    try {
      const response = await fetch(endpoint, { cache: "no-store", signal: request.signal })
      if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Réponse inattendue du service.")
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Lecture impossible.")
      if (!request.signal.aborted) { setItems(data.affiliations); setRefs(data.references) }
    } catch (failure) { if (!request.signal.aborted) setError(failure instanceof Error ? failure.message : "Lecture impossible.") }
    finally { if (!request.signal.aborted) setLoading(false) }
  }, [endpoint])
  useEffect(() => { void load(); return () => controller.current?.abort() }, [load])
  const start = (item?: ActorAffiliationView, readOnly = false, loanReturn = false) => {
    setEditing(loanReturn ? null : item || null); setViewing(readOnly); setReturning(loanReturn); setErrors({}); setUncertain(false)
    key.current = crypto.randomUUID(); payload.current = null
    setValues(item && !loanReturn ? { id_club: item.clubId, id_type_transfert: item.transferTypeId || "", id_affiliation_precedente: item.previousAffiliationId || "", date_debut: compactDateFromSheet(item.dateDebut), date_fin: compactDateFromSheet(item.dateFin), id_statut_affiliation: item.statusId, observations: item.observations } : loanReturn && item ? { ...blank(), id_type_transfert: "TRF002", id_affiliation_precedente: item.id } : blank())
    setOpen(true)
  }
  const set = (field: keyof Values, value: string) => { if (uncertain) return; key.current = crypto.randomUUID(); payload.current = null; setValues(current => ({ ...current, [field]: value })) }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (viewing || savingGuard.current || !refs.sportsWritesEnabled) return
    savingGuard.current = true; setSaving(true); setErrors({})
    if (!payload.current) payload.current = JSON.stringify({ ...values, actorId, idempotency_key: key.current, ...(editing ? { id: editing.id } : {}), ...(returning ? { action: "RETURN" } : {}) })
    try {
      const response = await fetch("/api/affiliations/athlete", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: payload.current })
      const data = await response.json()
      if (!response.ok) {
        const pending = response.status >= 500 || ["ATHLETE_RESERVE", "RESERVATION_A_REPRENDRE", "RESULTAT_INDETERMINE", "LIBERATION_A_REPRENDRE"].includes(data.code)
        setUncertain(pending); setErrors({ ...data.fields, _form: data.message || "Enregistrement impossible." }); return
      }
      setOpen(false); setUncertain(false); toast.success(returning ? "Retour de cession confirmé." : "Mouvement confirmé.")
      await load(); router.refresh(); if (onChanged) { try { await onChanged() } catch { toast.warning("Mouvement confirmé. Actualisez la fiche pour relire ses informations.") } }
    } catch { setUncertain(true); setErrors({ _form: "Résultat non confirmé. Conservez cette tentative et vérifiez son résultat avant de modifier les données." }) }
    finally { savingGuard.current = false; setSaving(false) }
  }
  const select = (field: keyof Values, title: string, options: { id: string; label: string }[], disabled = false) => <div className="space-y-2"><Label htmlFor={`transfer-${field}`}>{title}</Label><Select value={values[field] || "__empty"} onValueChange={value => set(field, value === "__empty" ? "" : value)} disabled={disabled || viewing || saving || uncertain}><SelectTrigger id={`transfer-${field}`} className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{!values[field] && <SelectItem value="__empty">{editing ? "Non renseigné" : "Sélectionner"}</SelectItem>}{options.map(option => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select>{errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}</div>
  const labels = ["Club", "Opération", "Précédent", "Début", "Fin", "Statut d’affiliation", "État"]
  const cells = (item: ActorAffiliationView) => [item.structure || "Structure introuvable", item.transferRole === "RETOUR" ? "Retour de cession" : item.transferRole === "SUSPENSION" ? "Interruption de cession" : item.transferType || "Non renseigné", item.previousAffiliationId || "—", formatDateForDisplay(item.dateDebut), item.dateFin ? formatDateForDisplay(item.dateFin) : "Ouverte", item.statut, item.temporalState || "Non renseigné"]
  const actions = (item: ActorAffiliationView) => <div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" aria-label="Consulter le mouvement" onClick={() => start(item, true)}><Eye /></Button><Button size="icon-sm" variant="ghost" aria-label="Modifier le mouvement" onClick={() => start(item)}><Pencil /></Button>{item.transferRole === "CESSION" && <Button size="icon-sm" variant="ghost" aria-label="Confirmer le retour de cession" onClick={() => start(item, false, true)}><Undo2 /></Button>}</div>
  return <Card className="min-w-0"><CardHeader><CardTitle>Transferts</CardTitle><div className="flex flex-wrap gap-2"><Button variant="outline" size="icon" aria-label="Actualiser les transferts" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /></Button><Button className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" disabled={loading || Boolean(error)} onClick={() => start()}><Plus />Ajouter un mouvement</Button></div></CardHeader><CardContent className="space-y-4">
    {!refs.sportsWritesEnabled && !loading && <p role="status" className="rounded-lg border border-amber-500/40 p-3 text-sm">{refs.sportsWriteBlockReason || "Écritures sportives non activées."}</p>}
    {error ? <p role="alert">{error}</p> : loading ? <p role="status">Chargement des transferts…</p> : !items.length ? <p className="text-sm text-muted-foreground">Aucun rattachement enregistré.</p> : <><div className="space-y-3 md:hidden">{items.map(item => <div key={item.id} className="rounded-lg border p-3">{labels.map((label, index) => <div key={label} className="grid grid-cols-2 gap-2 py-1 text-sm"><span className="text-muted-foreground">{label}</span><span className="break-words">{cells(item)[index]}</span></div>)}{actions(item)}</div>)}</div><div className="hidden overflow-x-auto rounded-lg border md:block"><Table aria-label="Transferts"><TableHeader><TableRow>{labels.map(label => <TableHead key={label}>{label}</TableHead>)}<TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{items.map(item => <TableRow key={item.id}>{cells(item).map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}<TableCell>{actions(item)}</TableCell></TableRow>)}</TableBody></Table></div></>}
  </CardContent><Sheet open={open} onOpenChange={next => { if (!saving && !uncertain) setOpen(next) }}><SheetContent className="w-full overflow-y-auto sm:max-w-lg"><form onSubmit={submit}><SheetHeader><SheetTitle>{returning ? "Confirmer le retour de cession" : viewing ? "Consulter le mouvement" : editing ? "Modifier le mouvement" : "Nouveau mouvement"}</SheetTitle><SheetDescription>Les dates sont inclusives. Une suspension d’affiliation ne suspend pas la licence. Un transfert conserve son numéro.</SheetDescription></SheetHeader><div className="space-y-4 px-4 py-2">
    {!returning && <>{select("id_type_transfert", "Type d’opération *", refs.transferTypes || [], Boolean(editing))}<div className="space-y-2"><Label htmlFor="transfer-club">Club bénéficiaire *</Label><SearchSelect id="transfer-club" value={values.id_club} onValueChange={value => set("id_club", value)} options={refs.clubs.filter(club => /^\d{7}$/.test(club.id))} disabled={viewing || saving || uncertain} placeholder="Rechercher un club" />{errors.id_club && <p className="text-sm text-destructive">{errors.id_club}</p>}</div></>}
    {(returning || (values.id_type_transfert && values.id_type_transfert !== "TRF001") || viewing && values.id_affiliation_precedente) && select("id_affiliation_precedente", returning ? "Cession d’origine" : "Rattachement précédent *", items.map(item => ({ id: item.id, label: `${item.structure} · ${formatDateForDisplay(item.dateDebut)}` })), Boolean(editing) || returning)}
    {(["date_debut", "date_fin"] as const).map(field => <div className="space-y-2" key={field}><Label htmlFor={`transfer-${field}`}>{field === "date_debut" ? "Date de début *" : returning ? "Fin reprise depuis le rattachement d’origine" : values.id_type_transfert === "TRF002" ? "Date de fin de cession *" : "Date de fin (facultative)"}</Label><CompactDateInput id={`transfer-${field}`} value={values[field]} onValueChange={value => set(field, value)} disabled={viewing || saving || uncertain || returning && field === "date_fin"} required={field === "date_debut" || field === "date_fin" && values.id_type_transfert === "TRF002" && !returning && !editing} optional={field === "date_fin"} />{errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}</div>)}
    {select("id_statut_affiliation", "Statut de l’affiliation", refs.statuses, returning || !editing && values.id_type_transfert !== "TRF001")}
    <div className="space-y-2"><Label htmlFor="transfer-notes">Observations</Label><Textarea id="transfer-notes" value={values.observations} onChange={event => set("observations", event.target.value)} disabled={viewing || saving || uncertain} /></div>
    {!refs.sportsWritesEnabled && !viewing && <p className="text-sm text-amber-600">{refs.sportsWriteBlockReason}</p>}
    {errors._form && <p role="alert" className="text-sm text-destructive">{errors._form}</p>}{uncertain && <p className="break-all text-xs">Clé de vérification : {key.current}. Sans reçu confirmé, aucune nouvelle écriture ne doit être forcée.</p>}
    </div><SheetFooter>{!viewing && <Button type="submit" className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" disabled={saving || !refs.sportsWritesEnabled}>{saving ? "Vérification…" : uncertain ? "Vérifier cette tentative" : "Confirmer"}</Button>}<Button type="button" variant="outline" disabled={saving || uncertain} onClick={() => setOpen(false)}>Fermer</Button></SheetFooter></form></SheetContent></Sheet></Card>
}
