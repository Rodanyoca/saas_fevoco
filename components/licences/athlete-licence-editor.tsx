"use client"
import { useRecordVersion } from "@/components/actors/record-management"
import { useAthleteLicenceCandidates } from "@/components/licences/use-athlete-licence-candidates"

import { useEffect, useRef, useState } from "react"
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
export type LicenceReferences = { clubs: Option[]; seasons: Option[]; statuses: Option[]; candidates: AthleteLicenceCandidate[]; sportsWritesEnabled?: boolean; sportsWriteBlockReason?: string; counters?: Array<{ clubId: string; seasonId: string; status: string }> }
const active = (value: string) => /^(ACTIF|ACTIVE)$/i.test(value.trim())
const civilDate = (value: string) => { try { return formatDateForSheet(value) } catch { return "" } }
export function AthleteLicenceEditor({ open, onOpenChange, references, editing, readOnly, mode, initialSeason, onSaved }: {
  open: boolean; onOpenChange: (open: boolean) => void; references: LicenceReferences; rows: AthleteLicenceView[]; editing: AthleteLicenceView | null; readOnly: boolean; mode: "ATHLETE" | "CLUB"; initialSeason: string; onSaved: () => void
}) {
  const revision = useRecordVersion("licence", "athlete", editing?.id || "", open && Boolean(editing) && !readOnly)
  const [season, setSeason] = useState(""), [club, setClub] = useState(""), [affiliation, setAffiliation] = useState("")
  const [number, setNumber] = useState(""), [date, setDate] = useState(""), [status, setStatus] = useState("")
  const [observations, setObservations] = useState(""), [selected, setSelected] = useState<string[]>([]), [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false), [errors, setErrors] = useState<Record<string, string>>({})
  const guard = useRef(false), requestKey = useRef(""), submitted = useRef<string | null>(null)
  const [uncertain, setUncertain] = useState(false)
  useEffect(() => {
    if (!open || uncertain) return
    setSeason(editing?.seasonId || initialSeason); setClub(editing?.clubId || ""); setAffiliation(editing?.affiliationId || "")
    setNumber(editing?.numero || ""); setDate(compactDateFromSheet(editing?.dateDelivrance || new Date().toISOString().slice(0, 10)))
    setStatus(editing?.statusId || references.statuses.find(item => active(item.label))?.id || "")
    setObservations(editing?.observations || ""); setSelected([]); setSearch(""); setErrors({}); requestKey.current = crypto.randomUUID(); submitted.current = null
  }, [open, editing, initialSeason, references.statuses, uncertain])
  const delivery = civilDate(date)
  const eligibilityResult = useAthleteLicenceCandidates(open && !editing && !uncertain, club, season, delivery)
  const candidates = eligibilityResult.candidates
  useEffect(() => {
    if (!editing && !uncertain && eligibilityResult.ready) {
      if (affiliation && !candidates.some(item => item.affiliationId === affiliation)) setAffiliation("")
      const valid = new Set(candidates.map(item => item.affiliationId))
      setSelected(current => { const next = current.filter(id => valid.has(id)); return next.length === current.length ? current : next })
    }
  }, [editing, uncertain, eligibilityResult.ready, candidates, affiliation])
  const eligibility = (item: AthleteLicenceCandidate) => item.renewable ? "Renouvelable" : "Première licence à enregistrer individuellement"
  const available = candidates.filter(item => eligibility(item) === "Renouvelable")
  const pick = (key: "club" | "season", value: string) => { (key === "club" ? setClub : setSeason)(value); setAffiliation(""); setSelected([]) }
  const blockedCounter = !editing && references.counters?.some(item => item.clubId === club && item.seasonId === season && item.status !== "PRET")
  const writesEnabled = references.sportsWritesEnabled === true
  const options = (items: Option[]) => items.filter(item => item.id.trim())
  const select = (id: string, value: string, change: (value: string) => void, items: Option[], disabled = false) => <Select value={value} onValueChange={change} disabled={disabled || saving}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options(items).map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (guard.current || readOnly || !writesEnabled || blockedCounter) return
    const candidate = candidates.find(item => item.affiliationId === affiliation)
    if (!editing && !uncertain && (!eligibilityResult.ready || (mode === 'ATHLETE' && !candidate))) return
    guard.current = true; setSaving(true); setErrors({})
    try {
      if (!uncertain || !submitted.current) {
        const fields = { date_delivrance: date, id_statut_licence: status, observations }
        const input = editing ? { ...fields, id: editing.id } : mode === 'CLUB' ? { ...fields, mode, id_club: club, id_saison: season, id_affiliations_athletes: selected.filter(id => available.some(item => item.affiliationId === id)) } : { ...fields, id_saison: season, id_athlete: candidate?.athleteId, id_affiliation_athlete: affiliation }
        requestKey.current = crypto.randomUUID(); submitted.current = JSON.stringify({ ...input, idempotency_key: requestKey.current })
      }
      const response = await fetch('/api/licences/athletes', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...(editing ? {'If-Match':revision.version} : {}) }, body: submitted.current }), payload = await response.json()
      if (!response.ok) {
        const unknown = Boolean(payload.uncertain) || response.status >= 500 || ['ATHLETE_RESERVE', 'RESERVATION_A_REPRENDRE', 'LIBERATION_A_REPRENDRE'].includes(payload.code)
        setUncertain(unknown); setErrors({ ...payload.fields, form: payload.message || 'Enregistrement impossible.' })
        if (!editing && !unknown) { setAffiliation(''); setSelected([]); submitted.current = null; eligibilityResult.reload() }
        return
      }
      setUncertain(false)
      toast.success(editing ? 'Licence modifiée' : mode === 'CLUB' ? 'Licences renouvelées et numéros confirmés' : 'Licence confirmée : ' + (payload.licence?.numero_licence || 'numéro attribué'))
      onOpenChange(false)
      try { onSaved() } catch { toast.message('Écriture confirmée. Actualisez les données liées.') }
    } catch { setUncertain(true); setErrors({ form: 'Résultat non confirmé. Vérifiez la même tentative avant toute nouvelle demande.' }) }
    finally { guard.current = false; setSaving(false) }
  }
  const fieldError = (key: string) => errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>
  return <Sheet open={open} onOpenChange={value => { if (!saving && !uncertain) onOpenChange(value) }}><SheetContent className="w-full overflow-y-auto sm:max-w-3xl"><form onSubmit={submit} className="flex min-h-full flex-col"><SheetHeader><SheetTitle>{readOnly ? "Consulter la licence" : editing ? "Modifier la licence" : mode === "CLUB" ? "Renouveler les licences d’un club" : "Enregistrer une licence"}</SheetTitle><SheetDescription>Le numéro est attribué par le serveur après confirmation. Son club d’attribution reste inchangé lors des transferts.</SheetDescription></SheetHeader>
    <fieldset disabled={readOnly || saving || uncertain} className="flex-1 space-y-5 px-4 py-2">
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="lic-season">Saison *</Label>{select("lic-season", season, value => pick("season", value), references.seasons, Boolean(editing))}</div><div className="space-y-2"><Label htmlFor="lic-club">Club *</Label><SearchSelect id="lic-club" value={club} onValueChange={value => pick("club", value)} options={options(references.clubs).filter(item => Boolean(editing) || /^\d{7}$/.test(item.id))} placeholder="Rechercher un club" disabled={Boolean(editing) || saving || readOnly} /></div>
      {mode === "ATHLETE" && <div className="space-y-2 sm:col-span-2"><Label htmlFor="lic-athlete">Athlète *</Label>{editing ? <Input id="lic-athlete" value={editing.athlete} disabled /> : <SearchSelect key={club + season} id="lic-athlete" value={affiliation} onValueChange={setAffiliation} options={candidates.map(item => ({ id: item.affiliationId, label: item.athleteName, keywords: item.athleteId }))} emptyMessage="Aucun athlète de ce club ne correspond à la recherche." placeholder={club ? "Nom ou identifiant de l’athlète (2 caractères minimum)" : "Sélectionnez d’abord un club"} disabled={!club || !season || !eligibilityResult.ready || saving || readOnly} />}{!editing && club && <p className="text-xs text-muted-foreground">Seules les affiliations actives permettant une nouvelle délivrance sont proposées.</p>}{fieldError("id_affiliation_athlete")}</div>}</div>
      {!editing && eligibilityResult.loading && <p role="status" className="text-sm">Vérification des athlètes éligibles…</p>}
      {!editing && eligibilityResult.error && <div role="alert" className="text-sm text-destructive"><p>{eligibilityResult.error}</p><Button type="button" variant="outline" onClick={eligibilityResult.reload}>Réessayer</Button></div>}
      {!editing && eligibilityResult.ready && !candidates.length && <p role="status" className="text-sm">Aucun athlète éligible pour ce club et cette saison.</p>}
      {!editing && eligibilityResult.conflicts > 0 && <p role="status" className="text-sm text-amber-600">{eligibilityResult.conflicts} dossier(s) exclus : rattachement ambigu ou opération persistante à vérifier. Reprenez l’opération existante si son résultat est incertain.</p>}
      {mode === "CLUB" && club && <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm">{selected.length} sélectionné(s) · {available.length} renouvelable(s)</p><Button type="button" variant="outline" size="sm" onClick={() => setSelected([...new Map(available.map(item => [item.athleteId, item.affiliationId])).values()])}>Tout sélectionner</Button></div><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher dans le club" /><div className="max-h-80 space-y-2 overflow-y-auto">{candidates.filter(item => item.athleteName.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr"))).map(item => <label htmlFor={`renew-${item.affiliationId}`} key={item.affiliationId} className="flex items-center gap-3 rounded-lg border p-3"><Checkbox id={`renew-${item.affiliationId}`} checked={selected.includes(item.affiliationId)} disabled={eligibility(item) !== "Renouvelable"} onCheckedChange={checked => setSelected(current => checked ? [...current.filter(id => candidates.find(candidate => candidate.affiliationId === id)?.athleteId !== item.athleteId), item.affiliationId] : current.filter(id => id !== item.affiliationId))} /><span className="min-w-0 flex-1"><span className="block font-medium">{item.athleteName}</span><span className="block text-xs text-muted-foreground">{eligibility(item)}</span></span></label>)}{!candidates.length && <p className="text-sm text-muted-foreground">Aucune affiliation enregistrée pour ce club.</p>}</div></div>}
      <div className="grid gap-4 sm:grid-cols-2">{mode === "ATHLETE" && <div className="space-y-2"><Label htmlFor="lic-number">Numéro de licence</Label><Input id="lic-number" readOnly value={number} placeholder="Attribué après confirmation" />{fieldError("numero_licence")}</div>}<div className="space-y-2"><Label htmlFor="lic-date">Date de délivrance *</Label><CompactDateInput id="lic-date" required disabled={Boolean(editing)} value={date} onValueChange={value => { setDate(value); setSelected([]); setAffiliation("") }} />{fieldError("date_delivrance")}</div><div className="space-y-2"><Label htmlFor="lic-status">Statut *</Label>{select("lic-status", status, setStatus, references.statuses)}{fieldError("id_statut_licence")}</div><div className="space-y-2 sm:col-span-2"><Label htmlFor="lic-observations">Observations</Label><Textarea id="lic-observations" value={observations} onChange={event => setObservations(event.target.value)} /></div></div>
      {editing && <div className="rounded-lg border p-3 text-sm"><p>Club d’attribution : {editing.club}</p><p>Club actuel : {editing.currentClub || 'Non renseigné'}</p><p>La suspension de licence ne modifie pas les affiliations.</p></div>}
      {errors.form && <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{errors.form}</p>}
    </fieldset>{!readOnly && (!writesEnabled || blockedCounter) && <p role="status" className="px-4 py-2 text-sm text-amber-600">{blockedCounter ? 'Compteur A_VERIFIER : attribution bloquée, sans saisie manuelle.' : references.sportsWriteBlockReason || 'Écritures sportives non activées.'}</p>}{uncertain && <p role="alert" className="break-all px-4 text-sm">Clé de vérification : {requestKey.current}. Ne modifiez pas la tentative d’issue inconnue.</p>}{revision.error && <p role="alert" className="text-sm text-destructive">{revision.error}</p>}<SheetFooter><Button type="button" variant="outline" disabled={saving || uncertain} onClick={() => onOpenChange(false)}>{readOnly ? 'Fermer' : 'Annuler'}</Button>{!readOnly && <Button type="submit" className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" disabled={saving || (Boolean(editing) && !revision.version) || !writesEnabled || blockedCounter || !season || !club || !status || (!editing && !uncertain && !eligibilityResult.ready) || (!editing && (mode === 'ATHLETE' ? !affiliation : !selected.length))}>{saving ? 'Enregistrement…' : uncertain ? 'Vérifier cette tentative' : editing ? 'Enregistrer les modifications' : mode === 'CLUB' ? 'Renouveler ' + selected.length + ' licence(s)' : 'Enregistrer la licence'}</Button>}</SheetFooter></form></SheetContent></Sheet>
}
