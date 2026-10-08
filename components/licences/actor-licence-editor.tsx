"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchSelect } from "@/components/ui/search-select"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatDateForDisplay, formatDateForSheet } from "@/lib/compact-date"
import type { ActorLicenceReferences, ActorLicenceView, LicenceOption } from "@/lib/actor-licences-model"

export type ActorLicenceEditorMode = "create" | "renew" | "view" | "edit"
const emptyForm = { id_type_acteur: "", id_acteur: "", id_affiliation_acteur: "", id_cycle_licence: "", numero_licence: "", date_delivrance: "", date_debut_validite: "", date_fin_validite: "", id_statut_licence: "", observations: "" }
export function ActorLicenceEditor({ open, onOpenChange, references, mode, licence, history, onSaved }: {
  open: boolean; onOpenChange: (open: boolean) => void; references: ActorLicenceReferences;
  mode: ActorLicenceEditorMode; licence: ActorLicenceView | null; history: ActorLicenceView[]; onSaved: () => void
}) {
  const [form, setForm] = useState(emptyForm), [errors, setErrors] = useState<Record<string, string>>({}), [pending, setPending] = useState(false)
  const guard = useRef(false), readOnly = mode === "view", locked = mode !== "create"
  useEffect(() => {
    if (!open) return
    const statusId = references.statuses.find(item => item.label.toUpperCase() === "ACTIVE")?.id || ""
    let nextStart = ""
    if (mode === "renew" && licence?.dateExpiration) {
      const day = new Date(`${licence.dateExpiration}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)
      nextStart = formatDateForDisplay(day.toISOString().slice(0, 10))
    }
    setForm(licence ? { id_type_acteur: licence.typeId, id_acteur: licence.actorId, id_affiliation_acteur: mode === "renew" ? "" : licence.affiliationId, id_cycle_licence: licence.cycleId, numero_licence: licence.numero === "—" ? "" : licence.numero, date_delivrance: mode === "renew" ? "" : formatDateForDisplay(licence.dateDelivrance), date_debut_validite: mode === "renew" ? nextStart : formatDateForDisplay(licence.dateDebut), date_fin_validite: mode === "renew" ? "" : formatDateForDisplay(licence.dateExpiration), id_statut_licence: mode === "renew" ? statusId : licence.statusId, observations: mode === "renew" ? "" : licence.observations } : { ...emptyForm, id_statut_licence: statusId })
    setErrors({})
  }, [open, mode, licence, references.statuses])
  const set = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }))
  const actor = references.actors.find(item => item.typeId === form.id_type_acteur && item.id === form.id_acteur)
  const actors = references.actors.filter(item => item.typeId === form.id_type_acteur)
  const affiliations = references.affiliations.filter(item => item.typeId === form.id_type_acteur && item.actorId === form.id_acteur)
  const selectedAffiliation = affiliations.find(item => item.id === form.id_affiliation_acteur)
  const needsAffiliation = Boolean(form.id_type_acteur && form.id_type_acteur !== "TAC004")
  const fieldError = (key: string) => errors[key] ? <p className="text-sm text-destructive">{errors[key]}</p> : null
  const select = (key: keyof typeof form, label: string, options: LicenceOption[], disabled = false) => <div className="space-y-2"><Label htmlFor={`actor-licence-${key}`}>{label}</Label><Select value={form[key]} onValueChange={value => { set(key, value); if (key === "id_type_acteur") { set("id_acteur", ""); set("id_affiliation_acteur", "") } }} disabled={disabled || pending || readOnly}><SelectTrigger id={`actor-licence-${key}`}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>{fieldError(key)}</div>
  const dateField = (key: "date_delivrance" | "date_debut_validite" | "date_fin_validite", label: string) => <div className="space-y-2"><Label htmlFor={`actor-licence-${key}`}>{label}</Label><CompactDateInput id={`actor-licence-${key}`} value={form[key]} onValueChange={value => set(key, value)} required disabled={pending || readOnly} aria-invalid={Boolean(errors[key])} />{fieldError(key)}</div>
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (guard.current || readOnly) return
    const fields: Record<string, string> = {}
    for (const key of ["date_delivrance", "date_debut_validite", "date_fin_validite"] as const) { try { if (!formatDateForSheet(form[key])) throw new Error() } catch { fields[key] = "Saisissez une date civile valide." } }
    if (Object.keys(fields).length) { setErrors(fields); return }
    guard.current = true; setPending(true); setErrors({})
    try {
      const response = await fetch("/api/licences/acteurs", { method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: licence?.id, id_affiliation_acteur: needsAffiliation ? form.id_affiliation_acteur : "" }) })
      const payload = await response.json()
      if (!response.ok) { setErrors({ ...payload.fields, form: payload.message || "Enregistrement impossible." }); return }
      toast.success(mode === "renew" ? "Licence renouvelée" : mode === "edit" ? "Licence modifiée" : "Licence enregistrée")
      onOpenChange(false); onSaved()
    } catch { setErrors({ form: "Service temporairement indisponible." }) }
    finally { guard.current = false; setPending(false) }
  }
  return <Sheet open={open} onOpenChange={value => !pending && onOpenChange(value)}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>{readOnly ? "Consulter la licence" : mode === "renew" ? "Renouveler la licence" : mode === "edit" ? "Modifier la licence" : "Enregistrer une licence"}</SheetTitle><SheetDescription>Licence individuelle par période. Une affiliation active est requise au début de validité, sauf pour les arbitres.</SheetDescription></SheetHeader><form onSubmit={submit} className="space-y-5 px-4 pb-28"><fieldset disabled={readOnly || pending} className="space-y-5">
    {licence && <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 text-sm"><div><span className="text-muted-foreground">Identifiant</span><p className="break-all font-mono">{licence.id}</p></div><div><span className="text-muted-foreground">Statut</span><p className="mt-1"><StatusBadge status={licence.statutEffectif.replaceAll("_", " ")} /></p></div></div>}
    <div className="grid gap-4 sm:grid-cols-2">{select("id_type_acteur", "Type d’acteur *", references.types, locked)}<div className="space-y-2"><Label htmlFor="actor-licence-actor">Acteur *</Label><SearchSelect id="actor-licence-actor" value={form.id_acteur} onValueChange={value => { set("id_acteur", value); set("id_affiliation_acteur", "") }} options={actors} disabled={locked || pending || !form.id_type_acteur || readOnly} placeholder="Nom ou identifiant de l’acteur" />{fieldError("id_acteur")}</div></div>
    {(actor || licence) && <div className="rounded-xl border p-4"><p className="font-semibold">{actor?.label || licence?.acteur}</p><p className="text-sm text-muted-foreground">{form.id_acteur} · {references.types.find(item => item.id === form.id_type_acteur)?.label}</p></div>}
    {needsAffiliation ? <div className="space-y-2">{select("id_affiliation_acteur", "Affiliation *", affiliations, !form.id_acteur)}{form.id_acteur && !affiliations.length && <p className="text-sm text-muted-foreground">Aucune affiliation enregistrée pour cet acteur.</p>}{selectedAffiliation && <p className="text-xs text-muted-foreground">{selectedAffiliation.status} · {formatDateForDisplay(selectedAffiliation.dateDebut) || "Début inconnu"} — {formatDateForDisplay(selectedAffiliation.dateFin) || "Sans date de fin"}</p>}</div> : form.id_type_acteur ? <p className="text-sm text-muted-foreground">Arbitre : affiliation non applicable.</p> : null}
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="actor-licence-number">Numéro officiel *</Label><Input id="actor-licence-number" required value={form.numero_licence} onChange={event => set("numero_licence", event.target.value)} />{fieldError("numero_licence")}</div>{select("id_cycle_licence", "Cycle *", references.cycles)}{dateField("date_delivrance", "Délivrée le *")}{dateField("date_debut_validite", "Début de validité *")}{dateField("date_fin_validite", "Expiration *")}{select("id_statut_licence", "Statut enregistré *", references.statuses)}<div className="space-y-2 sm:col-span-2"><Label htmlFor="actor-licence-observations">Observations</Label><Textarea id="actor-licence-observations" value={form.observations} onChange={event => set("observations", event.target.value)} /></div></div>
    </fieldset>{readOnly && <section className="space-y-3"><h3 className="font-semibold">Historique de l’acteur</h3><p className="text-sm text-muted-foreground">Affiliation : {licence?.affiliation}</p>{history.map(item => <div key={item.id} className="rounded-lg border p-3 text-sm"><p className="font-medium">{item.numero} · {item.cycle}</p><p className="text-muted-foreground">{formatDateForDisplay(item.dateDebut)} — {formatDateForDisplay(item.dateExpiration)}</p><StatusBadge status={item.statutEffectif.replaceAll("_", " ")} /></div>)}</section>}{errors.form && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.form}</p>}<SheetFooter className="absolute inset-x-0 bottom-0 border-t bg-background"><Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>{readOnly ? "Fermer" : "Annuler"}</Button>{!readOnly && <Button type="submit" className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90" disabled={pending || !form.id_type_acteur || !form.id_acteur || !form.id_cycle_licence || !form.numero_licence.trim() || !form.id_statut_licence || (needsAffiliation && !form.id_affiliation_acteur)}>{pending ? "Enregistrement…" : mode === "renew" ? "Renouveler la licence" : mode === "edit" ? "Enregistrer les modifications" : "Enregistrer la licence"}</Button>}</SheetFooter></form></SheetContent></Sheet>
}
