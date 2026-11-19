"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchSelect } from "@/components/ui/search-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { formatDateForSheet } from "@/lib/compact-date"
import type { ExistingLicenceActor } from "@/lib/existing-athlete-licence"
type Options = { clubs: Array<{ id: string; label: string }>; seasons: Array<{ id: string; label: string }>; currentSeasonId: string; selectedSeasonId: string; operationDate: string; actors: ExistingLicenceActor[]; licences: Array<{actorId: string; seasonId: string; number: string}>; reservations: string[] }
export function ExistingAthleteLicenceDialog() {
  const router = useRouter(), [open, setOpen] = useState(false), [club, setClub] = useState(""), [season, setSeason] = useState("")
  const [actor, setActor] = useState(""), [date, setDate] = useState(""), [confirmed, setConfirmed] = useState(false), [includeUnattached, setIncludeUnattached] = useState(false)
  const [options, setOptions] = useState<Options | null>(null), [error, setError] = useState(""), [saving, setSaving] = useState(false), [resume, setResume] = useState(false), [refresh, setRefresh] = useState(0)
  const guard = useRef(false), submitted = useRef<string | null>(null), sequence = useRef(0)
  const queryKey = JSON.stringify([open, refresh])
  const [loadedKey, setLoadedKey] = useState("")
  useEffect(() => {
    if (!open || resume) return
    const controller = new AbortController(), request = ++sequence.current
    setError("")
    fetch("/api/licences/athletes/existing?" + new URLSearchParams(), { cache: "no-store", signal: controller.signal }).then(async response => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Vérification indisponible.")
      if (controller.signal.aborted || request !== sequence.current) return
      setOptions(result); setLoadedKey(queryKey)
      setSeason(current => current || result.currentSeasonId)
    }).catch(reason => { if (!controller.signal.aborted) { setLoadedKey(queryKey); setOptions(null); setError(reason instanceof Error ? reason.message : "Vérification indisponible.") } })
    return () => controller.abort()
  }, [open, resume, queryKey])
  const loading = open && !resume && loadedKey !== queryKey
  const actors = useMemo(() => {
    if (!options) return []
    const licences = new Map((options.licences || []).filter(item => item.seasonId === season).map(item => [item.actorId, item.number]))
    const reserved = new Set(options.reservations || [])
    return options.actors.map(item => {
      const existing = licences.get(item.id), blocked = item.locked || reserved.has(item.id + ":" + season)
      return { ...item, state: existing ? "EXISTING" : blocked ? "RESERVED" : item.affiliationState || item.state,
        licenceNumber: existing, message: existing ? "Une licence existe déjà pour cette saison." : blocked ? "Une délivrance est déjà réservée pour cet athlète." : item.affiliationState === "READY" ? "Affiliation active : numéro automatique." : item.message }
    })
  }, [options, season])
  const selected = actors.find(item => item.id === actor)
  const needsAffiliation = selected?.state === "NEEDS_AFFILIATION"
  const admissible = selected?.state === "READY" || needsAffiliation
  const reset = () => { setActor(""); setDate(""); setConfirmed(false); submitted.current = null }
  const changeClub = (value: string) => { setClub(value); reset() }
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (guard.current || (!resume && (!admissible || loading || !club || !season || (needsAffiliation && (!date || !confirmed))))) return
    if (!resume && needsAffiliation) {
      try {
        const canonical = formatDateForSheet(date)
        if (!canonical || !options || canonical > options.operationDate) { setError("La date réelle d'affiliation doit être complète et effective à la délivrance."); return }
      } catch { setError("La date de première affiliation n'est pas une date civile valide."); return }
    }
    guard.current = true; setSaving(true); setError("")
    try {
      if (!submitted.current) submitted.current = JSON.stringify({ actorId: actor, clubId: club, seasonId: season, affiliationDate: needsAffiliation ? date : "", confirmAffiliation: needsAffiliation && confirmed ? "true" : "false", idempotencyKey: crypto.randomUUID() })
      const response = await fetch("/api/licences/athletes/existing", { method: "POST", headers: { "Content-Type": "application/json" }, body: submitted.current }), result = await response.json()
      if (!response.ok) {
        const partial = ["PARTIAL", "UNCERTAIN"].includes(result.state) || result.uncertain || response.status >= 500
        setResume(Boolean(partial)); setError(result.message || "Enregistrement refusé.")
        if (!partial) { submitted.current = null; setRefresh(value => value + 1); setActor("") }
        return
      }
      if (result.state !== "COMPLETE" || !result.licence || !result.affiliationId) throw new Error("Confirmation incomplète.")
      toast.success("Licence attribuée : " + result.numeroLicence)
      setResume(false); setOpen(false); submitted.current = null; router.refresh()
    } catch { setResume(true); setError("Résultat non confirmé. Reprenez la même tentative sans recréer l'athlète.") }
    finally { guard.current = false; setSaving(false) }
  }
  return <><Button type="button" className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" onClick={() => { reset(); setSeason(""); setClub(""); setOptions(null); setLoadedKey(""); setOpen(true) }}>Ajouter une licence</Button>
    <Sheet open={open} onOpenChange={value => { if (!saving && !resume) setOpen(value) }}><SheetContent className="flex w-full flex-col sm:max-w-2xl"><form className="flex min-h-0 flex-1 flex-col" onSubmit={save}>
      <SheetHeader><SheetTitle>Licence d’un athlète existant</SheetTitle><SheetDescription>Choisissez l’athlète : son affiliation active est réutilisée et le numéro est attribué automatiquement.</SheetDescription></SheetHeader>
      <fieldset disabled={saving || resume} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3">
        <label htmlFor="existing-unattached" className="flex items-center gap-2 text-sm"><Checkbox id="existing-unattached" checked={includeUnattached} onCheckedChange={value => { setIncludeUnattached(value === true); reset() }} />Rechercher un athlète existant à rattacher à ce club</label><p className="text-xs text-muted-foreground">Les identités sans affiliation ne sont pas présentées comme membres du club.</p><div className="space-y-2"><Label htmlFor="existing-athlete">Athlète existant *</Label><SearchSelect id="existing-athlete" value={actor} onValueChange={value => { setActor(value); const existing = actors.find(item => item.id === value); if (existing?.clubId) setClub(existing.clubId); setDate(""); setConfirmed(false) }} disabled={loading || !options} options={actors.filter(item => includeUnattached ? item.state !== "READY" && !item.clubId : item.affiliationState === "READY" && (!club || item.clubId === club)).map(item => ({ id: item.id, label: item.name, keywords: item.id }))} emptyMessage="Aucune identité correspondante. Vérifiez le club ou activez la recherche des athlètes sans affiliation." /></div>
        <div className="space-y-2"><Label htmlFor="existing-season">Saison *</Label><Select value={season} onValueChange={value => { setSeason(value); reset() }}><SelectTrigger id="existing-season"><SelectValue placeholder="Saison courante configurée" /></SelectTrigger><SelectContent>{options?.seasons.map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="existing-club">Club *</Label><SearchSelect id="existing-club" value={club} onValueChange={changeClub} options={options?.clubs || []} disabled={!options} /></div>
        {loading && <p role="status">Vérification de l’identité, des affiliations et des licences…</p>}
        {selected && !loading && <div role="status" className="rounded-lg border p-3 text-sm"><p>{selected.message}</p>{selected.club && <p>Club de l’affiliation : {selected.club}</p>}{selected.licenceNumber && <p>Licence existante : <strong>{selected.licenceNumber}</strong> · <a href="/licences" className="underline">Consulter les licences</a></p>}{["MOVEMENT_REQUIRED", "TRANSFER_REQUIRED", "CONFLICT"].includes(selected.state) && <a href="/transferts" className="underline" onClick={() => setOpen(false)}>Ouvrir les mouvements / régulariser l’historique</a>}</div>}
        {needsAffiliation && !loading && <section className="space-y-3 rounded-lg border p-3"><h3 className="font-semibold">Première affiliation à créer</h3><Label htmlFor="existing-affiliation-date">Date réelle de première affiliation *</Label><CompactDateInput id="existing-affiliation-date" value={date} onValueChange={value => { setDate(value); setError("") }} required /><p className="text-xs text-muted-foreground">Date inconnue : complétez cette information avant d’enregistrer. Aucune date ne sera inventée.</p><label htmlFor="existing-confirm" className="flex items-start gap-2 text-sm"><Checkbox id="existing-confirm" checked={confirmed} onCheckedChange={value => setConfirmed(value === true)} />Je confirme le rattachement de cet athlète au club sélectionné et la création de sa première affiliation.</label></section>}
        <p className="text-xs text-muted-foreground">Le numéro de licence sera attribué automatiquement. La délivrance utilisera la date de l’opération à Kinshasa.</p>
      </fieldset>
      {error && <div role="alert" className="px-4 py-2 text-sm text-destructive">{error}{!resume && <Button type="button" variant="outline" onClick={() => setRefresh(value => value + 1)}>Réessayer la vérification</Button>}</div>}
      {resume && <p role="status" className="px-4 text-sm">Conservez cette tentative : l’affiliation peut déjà être enregistrée. La reprise vérifiera les reçus avant toute écriture.</p>}
      <SheetFooter className="shrink-0"><Button type="button" variant="outline" disabled={saving || resume} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" disabled={saving || (!resume && (loading || !admissible || !club || !season || Boolean(needsAffiliation && (!date || !confirmed))))}>{saving ? "Enregistrement…" : resume ? "Reprendre l’enregistrement" : "Enregistrer"}</Button></SheetFooter>
    </form></SheetContent></Sheet></>
}
