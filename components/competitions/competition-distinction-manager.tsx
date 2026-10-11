"use client"

import { FormEvent, useId, useState } from "react"
import { useRouter } from "next/navigation"
import { Medal, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCompactDateInput, formatDateForDisplay } from "@/lib/compact-date"
import type { CompetitionPersonOption } from "@/lib/competition-people"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

const clean = (value: unknown) => String(value ?? "").trim()
const norm = (value: string) => value.toUpperCase()
export function CompetitionDistinctionManager({ competitionId, closed, unitLabels, clubLabels, types, targets, events, phases, matches, units, people, distinctions }: { competitionId: string; closed: boolean; unitLabels: Record<string, string>; clubLabels: Record<string, string>; types: Option[]; targets: Record<string, string>; events: SheetRow[]; phases: SheetRow[]; matches: SheetRow[]; units: SheetRow[]; people: CompetitionPersonOption[]; distinctions: SheetRow[] }) {
  const router = useRouter(), formId = useId(), titleId = useId(), [open, setOpen] = useState(false), [editing, setEditing] = useState<SheetRow | null>(null), [pending, setPending] = useState(false), [form, setForm] = useState<Record<string, string>>({ statut: "ACTIF" }), [error, setError] = useState("")
  const set = (key: string, value: string) => { setError(""); setForm((current) => ({ ...current, [key]: value, ...(key === "id_type_distinction" ? { id_unite_competition: "", id_acteur: "", id_type_acteur: "" } : {}), ...(key === "id_epreuve_competition" ? { id_phase_competition: "", id_match: "", id_unite_competition: "" } : {}), ...(key === "id_phase_competition" ? { id_match: "" } : {}) })) }
  const target = norm(targets[form.id_type_distinction] ?? ""), allowUnit = target.includes("UNITE"), allowActor = target.includes("ATHLETE") || target.includes("COACH") || target.includes("ACTEUR")
  const visiblePeople = people.filter((person) => target !== "ATHLETE" || norm(person.typeLabel).includes("ATHLETE")).filter((person) => target !== "COACH" || norm(person.typeLabel).includes("COACH") || norm(person.typeLabel).includes("ENTRAINEUR"))
  const availablePhases = phases.filter((row) => !form.id_epreuve_competition || clean(row.id_epreuve_competition) === form.id_epreuve_competition), availableMatches = matches.filter((row) => (!form.id_phase_competition || clean(row.id_phase_competition) === form.id_phase_competition) && (!form.id_epreuve_competition || availablePhases.some(phase => clean(phase.id_phase_competition) === clean(row.id_phase_competition)))), availableUnits = units.filter((row) => !form.id_epreuve_competition || clean(row.id_epreuve_competition) === form.id_epreuve_competition)
  const unitLabel = (row: SheetRow) => unitLabels[clean(row.id_unite_competition)] || clean(row.id_club) || clean(row.id_equipe_nationale_saison) || clean(row.id_unite_competition)
  const typeLabel = (row: SheetRow) => types.find(type => type.id === clean(row.id_type_distinction))?.label || clean(row.id_type_distinction)
  const beneficiary = (row: SheetRow) => [clean(row.id_unite_competition) ? unitLabel(row) : "", clean(row.id_acteur) ? people.find(person => person.id === clean(row.id_acteur) && person.typeId === clean(row.id_type_acteur))?.label || clean(row.id_acteur) : ""].filter(Boolean).join(" · ") || "Bénéficiaire non renseigné"
  const eventLabel = (row: SheetRow) => clean(events.find(event => clean(event.id_epreuve_competition) === clean(row.id_epreuve_competition))?.nom_epreuve) || clean(row.id_epreuve_competition) || "Toutes les épreuves"
  const clubLabel = (row: SheetRow) => {
    const unit = units.find(unit => clean(unit.id_unite_competition) === clean(row.id_unite_competition))
    const person = people.find(person => person.id === clean(row.id_acteur) && person.typeId === clean(row.id_type_acteur))
    const ids = [...new Set([clean(unit?.id_club), clean(person?.clubId)].filter(Boolean))]
    return ids.map(id => clubLabels[id] || id).join(" · ") || "—"
  }
  const contextLabel = (row: SheetRow) => {
    const matchId = clean(row.id_match), match = matches.find(match => clean(match.id_match) === matchId)
    const phaseId = clean(row.id_phase_competition) || clean(match?.id_phase_competition)
    const phase = clean(phases.find(phase => clean(phase.id_phase_competition) === phaseId)?.nom_phase) || phaseId
    if (!matchId) return phase || "—"
    const teams = match ? [clean(match.id_unite_a), clean(match.id_unite_b)].filter(Boolean).map(id => unitLabels[id] || id).join(" — ") : ""
    return [`Match : ${teams || matchId}`, match ? formatDateForDisplay(clean(match.date_match)) : "", phase].filter(Boolean).join(" · ")
  }
  function startEdit(row: SheetRow) { setError(""); setEditing(row); setForm({ statut: clean(row.statut), observations: clean(row.observations) }); setOpen(true) }
  async function submit(event: FormEvent) { event.preventDefault(); setPending(true); setError(""); try { const suffix = editing ? `/${encodeURIComponent(clean(editing.id_distinction_competition))}` : "", response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/distinctions${suffix}`, { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }), payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Enregistrement impossible."); toast.success(editing ? "Distinction modifiée" : "Distinction attribuée"); setOpen(false); setEditing(null); setForm({ statut: "ACTIF" }); router.refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : "Enregistrement impossible.") } finally { setPending(false) } }
  return <section className="min-w-0 space-y-4" aria-labelledby={titleId}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id={titleId} className="flex items-center gap-2 font-semibold"><Medal className="h-4 w-4" />Distinctions obtenues</h3><p className="text-sm text-muted-foreground">Récompenses attribuées aux unités engagées et aux acteurs de la compétition.</p></div>{!closed ? <Button onClick={() => { setError(""); setEditing(null); setForm({ statut: "ACTIF" }); setOpen(true) }} disabled={!types.length}><Plus className="mr-2 h-4 w-4" />Attribuer une distinction</Button> : null}</div>
    <div className="min-w-0 overflow-hidden rounded-lg border"><Table><TableHeader><TableRow><TableHead>Distinction</TableHead><TableHead>Épreuve</TableHead><TableHead>Club</TableHead><TableHead>Phase ou match</TableHead><TableHead>Statut</TableHead>{!closed ? <TableHead className="w-24 text-right">Actions</TableHead> : null}</TableRow></TableHeader><TableBody>{distinctions.map(row => <TableRow key={clean(row.id_distinction_competition)}>
      <TableCell className="max-w-72 whitespace-normal"><Badge variant="secondary">{typeLabel(row)}</Badge><p className="mt-1 text-xs text-muted-foreground">{beneficiary(row)}</p></TableCell>
      <TableCell className="whitespace-normal">{eventLabel(row)}</TableCell>
      <TableCell className="whitespace-normal">{clubLabel(row)}</TableCell>
      <TableCell className="max-w-72 whitespace-normal">{contextLabel(row)}</TableCell>
      <TableCell><StatusBadge status={clean(row.statut)} /></TableCell>
      {!closed ? <TableCell><div className="flex justify-end gap-1"><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label={`Modifier la distinction ${typeLabel(row)} de ${beneficiary(row)}`} onClick={() => startEdit(row)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Modifier la distinction</TooltipContent></Tooltip></TooltipProvider></div></TableCell> : null}
    </TableRow>)}{!distinctions.length ? <TableRow><TableCell colSpan={closed ? 5 : 6} className="h-24 whitespace-normal text-center text-muted-foreground">Aucune distinction enregistrée pour cette compétition</TableCell></TableRow> : null}</TableBody></Table></div>
    <Sheet open={open && !closed} onOpenChange={next => { if (!pending) setOpen(next) }}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>{editing ? "Modifier la distinction" : "Attribuer une distinction"}</SheetTitle><SheetDescription>Le bénéficiaire autorisé dépend du type sélectionné.</SheetDescription></SheetHeader><form id={formId} onSubmit={submit} className="space-y-4 px-4 pb-4">
      {editing ? <><Choice label="Statut" value={form.statut} options={[{ id: "ACTIF", label: "Actif" }, { id: "INACTIF", label: "Inactif" }]} onChange={(value) => set("statut", value)} /></> : <><Choice label="Type" value={form.id_type_distinction} options={types} onChange={(value) => set("id_type_distinction", value)} /><Choice label="Épreuve (facultatif)" value={form.id_epreuve_competition} options={events.map((row) => ({ id: clean(row.id_epreuve_competition), label: clean(row.nom_epreuve) }))} onChange={(value) => set("id_epreuve_competition", value)} />{allowUnit ? <Choice label="Unité bénéficiaire" value={form.id_unite_competition} options={availableUnits.map((row) => ({ id: clean(row.id_unite_competition), label: unitLabel(row) }))} onChange={(value) => set("id_unite_competition", value)} /> : null}{allowActor ? <Choice label="Acteur bénéficiaire" value={form.id_acteur} options={visiblePeople.map((person) => ({ id: person.id, label: `${person.label} · ${person.typeLabel}` }))} onChange={(value) => { const person = visiblePeople.find((item) => item.id === value); setForm((current) => ({ ...current, id_acteur: value, id_type_acteur: person?.typeId ?? "" })) }} /> : null}<Choice label="Phase (facultatif)" value={form.id_phase_competition} options={availablePhases.map((row) => ({ id: clean(row.id_phase_competition), label: clean(row.nom_phase) }))} onChange={(value) => set("id_phase_competition", value)} /><Choice label="Match (facultatif)" value={form.id_match} options={availableMatches.map((row) => ({ id: clean(row.id_match), label: clean(row.id_match) }))} onChange={(value) => set("id_match", value)} /><Field label="Date d’attribution"><Input aria-label="Date d’attribution" disabled={pending} inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={form.date_attribution ?? ""} onChange={(e) => set("date_attribution", formatCompactDateInput(e.target.value))} /></Field></>}
      <Field label="Observations" wide><Textarea aria-label="Observations" disabled={pending} value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button><Button disabled={pending}>{pending ? "Enregistrement..." : "Enregistrer"}</Button></div>
    </form></SheetContent></Sheet>
  </section>
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}</div> }
function Choice({ label, value, options, onChange }: { label: string; value?: string; options: Option[]; onChange: (value: string) => void }) { return <Field label={label}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full" aria-label={label}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
