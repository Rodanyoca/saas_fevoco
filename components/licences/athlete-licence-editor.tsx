"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchSelect } from "@/components/ui/search-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { compactDateFromSheet, formatDateForSheet } from "@/lib/compact-date"
import type { AthleteLicenceView } from "@/lib/licences-overview"
import type { AthleteLicenceCandidate } from "@/lib/athlete-licence-creation"

type Option = { id: string; label: string }
export type LicenceReferences = { clubs: Option[]; seasons: Option[]; statuses: Option[]; candidates: AthleteLicenceCandidate[] }
const active = (value: string) => /^(ACTIF|ACTIVE)$/i.test(value.trim())
const civilDate = (value: string) => { try { return formatDateForSheet(value) } catch { return "" } }
export function AthleteLicenceEditor({ open, onOpenChange, references, rows, editing, readOnly, mode, initialSeason, onSaved }: {
  open: boolean; onOpenChange: (open: boolean) => void; references: LicenceReferences; rows: AthleteLicenceView[]; editing: AthleteLicenceView | null; readOnly: boolean; mode: "ATHLETE" | "CLUB"; initialSeason: string; onSaved: () => void
}) {
  const [season, setSeason] = useState(""), [club, setClub] = useState(""), [affiliation, setAffiliation] = useState("")
  const [number, setNumber] = useState(""), [date, setDate] = useState(""), [status, setStatus] = useState("")
  const [observations, setObservations] = useState(""), [selected, setSelected] = useState<string[]>([]), [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false), [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!open) return
    setSeason(editing?.seasonId || initialSeason); setClub(editing?.clubId || ""); setAffiliation(editing?.affiliationId || "")
    setNumber(editing?.numero || ""); setDate(compactDateFromSheet(editing?.dateDelivrance || new Date().toISOString().slice(0, 10)))
    setStatus(editing?.statusId || references.statuses.find(item => active(item.label))?.id || "")
    setObservations(editing?.observations || ""); setSelected([]); setSearch(""); setErrors({})
  }, [open, editing, initialSeason, references.statuses])
  const candidates = references.candidates.filter(item => item.clubId === club && item.affiliationId.trim())
  const delivery = civilDate(date)
  const eligibility = (item: AthleteLicenceCandidate) => {
    if (rows.some(row => row.athleteId === item.athleteId && row.seasonId === season)) return "Déjà licencié pour cette saison"
    const start = civilDate(item.dateDebut), end = item.dateFin ? civilDate(item.dateFin) : ""
    if (!active(item.affiliationStatus) || !start || !delivery || start > delivery || (item.dateFin && (!end || end < delivery))) return "Affiliation inactive à cette date"
    return rows.some(row => row.athleteId === item.athleteId && row.seasonId !== season && row.numero && row.dateDelivrance <= delivery) ? "Renouvelable" : "Première licence à enregistrer individuellement"
  }
  const available = candidates.filter(item => eligibility(item) === "Renouvelable")
  const pick = (key: "club" | "season", value: string) => { (key === "club" ? setClub : setSeason)(value); setAffiliation(""); setSelected([]) }
  const options = (items: Option[]) => items.filter(item => item.id.trim())
  const select = (id: string, value: string, change: (value: string) => void, items: Option[], disabled = false) => <Select value={value} onValueChange={change} disabled={disabled || saving}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options(items).map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (saving || readOnly) return
    const candidate = candidates.find(item => item.affiliationId === affiliation)
    if (!editing && mode === "ATHLETE" && !candidate) return
    setSaving(true); setErrors({})
    try {
      const fields = { numero_licence: number, date_delivrance: date, id_statut_licence: status, observations }
      const input = editing ? { ...fields, id: editing.id } : mode === "CLUB" ? { ...fields, mode, id_club: club, id_saison: season, id_affiliations_athletes: selected.filter(id => available.some(item => item.affiliationId === id)) } : { ...fields, id_saison: season, id_athlete: candidate?.athleteId, id_affiliation_athlete: affiliation }
      const response = await fetch("/api/licences/athletes", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }), payload = await response.json()
      if (!response.ok) { setErrors({ ...payload.fields, form: payload.message || "Enregistrement impossible." }); return }
      toast.success(editing ? "Licence modifiée" : mode === "CLUB" ? "Licences renouvelées" : "Licence enregistrée")
      onOpenChange(false); onSaved()
    } catch { setErrors({ form: "Service temporairement indisponible." }) }
    finally { setSaving(false) }
  }
  const fieldError = (key: string) => errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>
  return <Sheet open={open} onOpenChange={value => { if (!saving) onOpenChange(value) }}><SheetContent className="w-full overflow-y-auto sm:max-w-3xl"><form onSubmit={submit} className="flex min-h-full flex-col"><SheetHeader><SheetTitle>{readOnly ? "Consulter la licence" : editing ? "Modifier la licence" : mode === "CLUB" ? "Renouveler les licences d’un club" : "Enregistrer une licence"}</SheetTitle><SheetDescription>La licence est liée à une affiliation au club et à une saison.</SheetDescription></SheetHeader>
    <fieldset disabled={readOnly || saving} className="flex-1 space-y-5 px-4 py-2">
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="lic-season">Saison *</Label>{select("lic-season", season, value => pick("season", value), references.seasons, Boolean(editing))}</div><div className="space-y-2"><Label htmlFor="lic-club">Club *</Label><SearchSelect id="lic-club" value={club} onValueChange={value => pick("club", value)} options={options(references.clubs)} placeholder="Rechercher un club" disabled={Boolean(editing) || saving || readOnly} /></div>
      {mode === "ATHLETE" && <div className="space-y-2 sm:col-span-2"><Label htmlFor="lic-athlete">Athlète *</Label>{editing ? <Input id="lic-athlete" value={editing.athlete} disabled /> : <SearchSelect id="lic-athlete" value={affiliation} onValueChange={setAffiliation} options={candidates.map(item => ({ id: item.affiliationId, label: item.athleteName, keywords: item.athleteId }))} placeholder={club ? "Rechercher parmi les affiliés" : "Sélectionnez d’abord un club"} disabled={!club || saving || readOnly} />}{fieldError("id_affiliation_athlete")}</div>}</div>
      {mode === "CLUB" && club && <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm">{selected.length} sélectionné(s) · {available.length} renouvelable(s)</p><Button type="button" variant="outline" size="sm" onClick={() => setSelected([...new Map(available.map(item => [item.athleteId, item.affiliationId])).values()])}>Tout sélectionner</Button></div><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher dans le club" /><div className="max-h-80 space-y-2 overflow-y-auto">{candidates.filter(item => item.athleteName.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr"))).map(item => <label htmlFor={`renew-${item.affiliationId}`} key={item.affiliationId} className="flex items-center gap-3 rounded-lg border p-3"><Checkbox id={`renew-${item.affiliationId}`} checked={selected.includes(item.affiliationId)} disabled={eligibility(item) !== "Renouvelable"} onCheckedChange={checked => setSelected(current => checked ? [...current.filter(id => candidates.find(candidate => candidate.affiliationId === id)?.athleteId !== item.athleteId), item.affiliationId] : current.filter(id => id !== item.affiliationId))} /><span className="min-w-0 flex-1"><span className="block font-medium">{item.athleteName}</span><span className="block text-xs text-muted-foreground">{eligibility(item)}</span></span></label>)}{!candidates.length && <p className="text-sm text-muted-foreground">Aucune affiliation enregistrée pour ce club.</p>}</div></div>}
      <div className="grid gap-4 sm:grid-cols-2">{mode === "ATHLETE" && <div className="space-y-2"><Label htmlFor="lic-number">Numéro de licence *</Label><Input id="lic-number" required value={number} onChange={event => setNumber(event.target.value)} />{fieldError("numero_licence")}</div>}<div className="space-y-2"><Label htmlFor="lic-date">Date de délivrance *</Label><CompactDateInput id="lic-date" required value={date} onValueChange={value => { setDate(value); setSelected([]) }} />{fieldError("date_delivrance")}</div><div className="space-y-2"><Label htmlFor="lic-status">Statut *</Label>{select("lic-status", status, setStatus, references.statuses)}{fieldError("id_statut_licence")}</div><div className="space-y-2 sm:col-span-2"><Label htmlFor="lic-observations">Observations</Label><Textarea id="lic-observations" value={observations} onChange={event => setObservations(event.target.value)} /></div></div>
      {errors.form && <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{errors.form}</p>}
    </fieldset><SheetFooter><Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>{readOnly ? "Fermer" : "Annuler"}</Button>{!readOnly && <Button type="submit" className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" disabled={saving || !season || !club || !status || (!editing && (mode === "ATHLETE" ? !affiliation : !selected.length))}>{saving ? "Enregistrement…" : editing ? "Enregistrer les modifications" : mode === "CLUB" ? `Renouveler ${selected.length} licence(s)` : "Enregistrer la licence"}</Button>}</SheetFooter></form></SheetContent></Sheet>
}
