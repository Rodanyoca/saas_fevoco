"use client"

import { useId, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { formatCompactDateInput, formatDateForDisplay } from "@/lib/compact-date"
import type { SheetRow } from "@/lib/google-sheets"
import type { Option, competitionData } from "@/lib/competitions-v2"

type Detail = NonNullable<ReturnType<typeof competitionData>>
const text = (value: unknown) => String(value ?? "").trim()

export function CompetitionEntryEditSheet({ unit, detail, clubOptions, label }: { unit: SheetRow; detail: Detail; clubOptions: Option[]; label: string }) {
  const router = useRouter(), formId = useId()
  const [open, setOpen] = useState(false), [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const unitId = text(unit.id_unite_competition)
  const participation = detail.participants.find(row => text(row.id_participation) === text(unit.id_participation))
  const assignment = detail.phasesUnites.find(row => text(row.id_unite_competition) === unitId && text(row.id_type_affectation_phase) === "TAP001")
  const event = detail.epreuves.find(row => text(row.id_epreuve_competition) === text(unit.id_epreuve_competition))
  const locked = Boolean(detail.matches.some(row => text(row.id_unite_a) === unitId || text(row.id_unite_b) === unitId)
    || detail.phasesUnites.some(row => text(row.id_unite_competition) === unitId && text(row.id_phase_unite) !== text(assignment?.id_phase_unite))
    || detail.classements.some(row => text(row.id_unite_competition) === unitId)
    || detail.distinctions.some(row => text(row.id_unite_competition) === unitId)
    || detail.intervenants.some(row => text(row.id_unite_competition) === unitId))
  const initial = () => ({ id_club: text(unit.id_club), id_phase_competition: text(assignment?.id_phase_competition), id_groupe: text(assignment?.id_groupe), date_inscription: formatDateForDisplay(text(participation?.date_inscription)), statut: text(participation?.statut_participation) || text(unit.statut), observations: text(participation?.observations) || text(unit.observations) })
  const [form, setForm] = useState(initial)
  const set = (key: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [key]: value, ...(key === "id_phase_competition" ? { id_groupe: "" } : {}) }))
    setErrors(current => ({ ...current, [key]: "", _form: "", ...(key === "id_phase_competition" ? { id_groupe: "" } : {}) }))
  }
  const phase = detail.phases.find(row => text(row.id_phase_competition) === form.id_phase_competition)
  const phases = detail.phases.filter(row => text(row.id_epreuve_competition) === text(unit.id_epreuve_competition) && (text(row.statut) === "ACTIF" || text(row.id_phase_competition) === form.id_phase_competition))
  const groups = detail.groupes.filter(row => text(row.id_phase_competition) === form.id_phase_competition && (text(row.statut) === "ACTIF" || text(row.id_groupe) === form.id_groupe))
  const clubs = clubOptions.some(row => row.id === text(unit.id_club)) ? clubOptions : [...clubOptions, ...(text(unit.id_club) ? [{ id: text(unit.id_club), label }] : [])]

  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setErrors({})
    try {
      const response = await fetch(`/api/competitions/${encodeURIComponent(detail.competition.id)}/unites/${encodeURIComponent(unitId)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) })
      const payload = await response.json()
      if (!response.ok) { setErrors({ ...payload.fields, _form: payload.error ?? "Modification impossible." }); return }
      toast.success("Engagement modifié"); setOpen(false); router.refresh()
    } catch { setErrors({ _form: "La modification n’a pas pu être enregistrée. Réessayez." }) } finally { setPending(false) }
  }
  if (detail.competition.statut === "TERMINEE") return null
  return <><Button variant="ghost" size="icon" aria-label={`Modifier l’engagement de ${label}`} title="Modifier" onClick={() => { setForm(initial()); setErrors({}); setOpen(true) }}><Pencil className="size-4" /></Button>
    <Sheet open={open} onOpenChange={next => { if (!pending) setOpen(next) }}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
      <SheetHeader><SheetTitle>Modifier l’équipe engagée</SheetTitle><SheetDescription>{label} · {text(event?.nom_epreuve)}. L’identifiant et l’épreuve sont conservés.</SheetDescription></SheetHeader>
      <form id={formId} onSubmit={submit} className="grid gap-4 px-4 pb-6 sm:grid-cols-2">
        {locked ? <p className="text-sm text-muted-foreground sm:col-span-2">Cet engagement est utilisé par des matchs, qualifications ou intervenants. Seules la date d’inscription et les observations restent modifiables.</p> : null}
        <Choice label="Club représenté" value={form.id_club || "__none"} options={[...(text(unit.id_type_unite_competition) === "TUC002" ? [{ id: "__none", label: "Sans club" }] : []), ...clubs]} onChange={value => set("id_club", value === "__none" ? "" : value)} disabled={pending || locked || Boolean(text(unit.id_equipe_nationale_saison))} error={errors.id_club} />
        <Choice label="Phase initiale" value={form.id_phase_competition} options={phases.map(row => ({ id: text(row.id_phase_competition), label: text(row.nom_phase) }))} onChange={value => set("id_phase_competition", value)} disabled={pending || locked} error={errors.id_phase_competition} />
        {text(phase?.id_mode_phase) === "MPH001" ? <Choice label="Groupe" value={form.id_groupe} options={groups.map(row => ({ id: text(row.id_groupe), label: text(row.nom_groupe) }))} onChange={value => set("id_groupe", value)} disabled={pending || locked} error={errors.id_groupe} /> : null}
        <Choice label="Statut" value={form.statut} options={[{ id: "ACTIF", label: "Actif" }, { id: "INACTIF", label: "Inactif" }]} onChange={value => set("statut", value)} disabled={pending || locked} error={errors.statut} />
        <div className="space-y-2"><Label htmlFor={`${formId}-date`}>Date d’inscription</Label><Input id={`${formId}-date`} inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={form.date_inscription} onChange={event => set("date_inscription", formatCompactDateInput(event.target.value))} disabled={pending} aria-invalid={!!errors.date_inscription} />{errors.date_inscription ? <p className="text-xs text-destructive">{errors.date_inscription}</p> : null}</div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor={`${formId}-observations`}>Observations</Label><Textarea id={`${formId}-observations`} value={form.observations} onChange={event => set("observations", event.target.value)} disabled={pending} /></div>
        {!participation || !assignment ? <p role="alert" className="text-sm text-destructive sm:col-span-2">L’inscription ou l’affectation initiale est absente du référentiel. La modification est indisponible.</p> : null}
        {errors._form ? <p role="alert" className="text-sm text-destructive sm:col-span-2">{errors._form}</p> : null}
      </form>
      <SheetFooter className="flex-row justify-end"><Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button><Button form={formId} disabled={pending || !participation || !assignment}>{pending ? <><Loader2 className="size-4 animate-spin" />Enregistrement…</> : "Enregistrer"}</Button></SheetFooter>
    </SheetContent></Sheet>
  </>
}

function Choice({ label, value, options, onChange, disabled, error }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; disabled: boolean; error?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger className="w-full" aria-label={label} aria-invalid={!!error}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select>{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>
}
