"use client"
import { useRecordVersion } from "@/components/actors/record-management"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ActorSexOption } from "@/lib/actor-references"
import type { Athlete, AthleteLicence } from "@/lib/types"
import { formatSheetDate } from "@/lib/date-utils"
import { formatDateForSheet } from "@/lib/compact-date"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import type { RegistrationOptions } from "@/lib/athlete-registration"
import { AvatarFileField, uploadAvatarFile } from "@/components/actors/avatar-file-field"
import { calculateAge } from "@/lib/date-utils"
import { Contact, Fingerprint, Info, Layers, UserRound, UsersRound } from "lucide-react"
import { SearchSelect } from "@/components/ui/search-select"

export type SavedAthlete = Pick<Athlete, "idAthlete" | "idNational" | "idFivb" | "idSexe" | "nomComplet" | "dateDeNaissance" | "lieuNaissance" | "sexe" | "nationalite" | "telephone" | "email" | "adresse" | "observations" | "avatarDriveId" | "avatarDriveUrl" | "statut">

function formStatus(value: string | undefined) {
  const status = String(value ?? "").trim().toUpperCase()
  if (status === "INACTIF" || status === "INACTIVE") return "INACTIF"
  return "ACTIF"
}

function initialDateValue(value: string | undefined) {
  if (!value) return ""
  const formatted = formatSheetDate(value)
  return formatted === "-" ? "" : formatted
}

function athleteFormValues(athlete: Athlete | undefined, sexes: ActorSexOption[]) {
  return {
    idNational: athlete?.idNational ?? "", idFivb: athlete?.idFivb ?? "",
    nomComplet: athlete?.nomComplet ?? "", dateDeNaissance: initialDateValue(athlete?.dateDeNaissance),
    lieuDeNaissance: athlete?.lieuNaissance ?? "",
    idSexe: sexes.find((option) => option.id === athlete?.idSexe || option.nom === athlete?.sexe)?.id ?? "",
    nationalite: athlete?.nationalite ?? "", telephone: athlete?.telephone ?? "",
    email: athlete?.email ?? "", adresse: athlete?.adresse ?? "", observations: athlete?.observations ?? "",
    statut: formStatus(athlete?.statut),
  }
}

export function AthleteFormDialog({ athlete, sexes, onSaved, onViewExisting }: {
  athlete?: Athlete
  sexes: ActorSexOption[]
  onSaved: (athlete: SavedAthlete, licence?: AthleteLicence) => void
  onViewExisting?: (id: string) => void
}) {
  const editing = Boolean(athlete)
  const [open, setOpen] = useState(false); const revision = useRecordVersion("actor", "athlete", athlete?.idAthlete || "", Boolean(athlete) && open)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [form, setForm] = useState(() => athleteFormValues(athlete, sexes))

  const [options, setOptions] = useState<RegistrationOptions | null>(null)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [registration, setRegistration] = useState({ clubId: "", affiliationDate: "", seasonId: "" })
  const [recovery, setRecovery] = useState(false)
  const [existingId, setExistingId] = useState("")
  const guard = useRef(false), key = useRef(""), payload = useRef(""), previousBase = useRef("")
  useEffect(() => {
    if (!open || editing || recovery) return
    const controller = new AbortController()
    setLoadingOptions(true)
    fetch("/api/athletes/registration", { signal: controller.signal }).then(async response => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Chargement des clubs et saisons impossible.")
      if (controller.signal.aborted) return
      setOptions(data)
      setRegistration(current => ({ ...current, seasonId: current.seasonId || data.currentSeasonId }))
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Chargement impossible.") })
      .finally(() => { if (!controller.signal.aborted) setLoadingOptions(false) })
    return () => controller.abort()
  }, [open, editing, recovery])
  const changeOpen = (next: boolean) => { if (!guard.current && !recovery) setOpen(next) }

  const resetAfterCreate = () => {
    if (!editing) { setForm(athleteFormValues(undefined, sexes)); setRegistration({ clubId: "", affiliationDate: "", seasonId: options?.currentSeasonId || "" }); key.current = ""; payload.current = ""; previousBase.current = "" }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (guard.current) return
    if (!editing && !recovery) {
      try {
        if (!registration.clubId || !registration.seasonId || !registration.affiliationDate) throw new Error("Le club, la date de première affiliation et la saison sont obligatoires.")
        const firstDate = formatDateForSheet(registration.affiliationDate)
        if (!options || firstDate > options.operationDate) throw new Error("La première affiliation doit être effective à la délivrance.")
        if (form.dateDeNaissance) formatDateForSheet(form.dateDeNaissance)
        const base = JSON.stringify({ ...form, ...registration })
        if (!key.current || previousBase.current !== base) key.current = crypto.randomUUID()
        previousBase.current = base
        payload.current = JSON.stringify({ ...form, ...registration, idempotencyKey: key.current })
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Veuillez corriger le formulaire."); return }
    }
    guard.current = true; setPending(true); setError(""); setExistingId("")
    try {
      const response = await fetch(editing ? `/api/athletes/${encodeURIComponent(athlete!.idAthlete)}` : "/api/athletes", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...(editing ? {"If-Match":revision.version} : {}) },
        body: editing ? JSON.stringify(form) : payload.current,
      }).catch(() => { if (!editing) setRecovery(true); throw new Error("Résultat non confirmé. Reprenez la même tentative.") })
      const result = await response.json().catch(() => { if (!editing) setRecovery(true); throw new Error("Réponse non confirmée. Vérifiez la même tentative.") })
      if (!response.ok) {
        if (!editing) { setRecovery(recovery || result.state === "PARTIAL" || result.state === "UNCERTAIN" || (response.status >= 500 && result.state !== "REJECTED")); setExistingId(result.existingAthleteId || "") }
        throw new Error(result.message || "Enregistrement impossible.")
      }
      setRecovery(false)
      let savedAthlete: SavedAthlete = result.athlete
      if (avatarFile) {
        try {
          savedAthlete = { ...savedAthlete, ...await uploadAvatarFile("athlete", savedAthlete.idAthlete, avatarFile) }
        } catch (avatarError) {
          onSaved(savedAthlete, result.licence)
          toast.warning(`${result.message} ${avatarError instanceof Error ? avatarError.message : "L’avatar n’a pas pu être enregistré."}`)
          resetAfterCreate()
          setOpen(false)
          setAvatarFile(null)
          return
        }
      }
      onSaved(savedAthlete, result.licence); toast.success(result.message); resetAfterCreate(); setOpen(false); setAvatarFile(null)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message); toast.error(message)
    } finally { guard.current = false; setPending(false) }
  }

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetTrigger asChild><Button variant={editing ? "outline" : "default"} className={editing ? undefined : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{editing ? "Modifier l’athlète" : "Créer un athlète"}</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{editing ? "Modifier l’athlète" : "Créer un athlète"}</SheetTitle>
          <SheetDescription>{editing ? "Modifiez les informations générales de l’athlète." : "Créez l’identité, la première affiliation et la licence en un seul enregistrement."}</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-6 px-4 pb-6">
          <fieldset disabled={pending || recovery} className="space-y-6">
          {editing ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Identifiant</Label><Input value={athlete!.idAthlete} disabled /></div>
              <div className="space-y-2"><Label htmlFor="athlete-nomComplet">Nom complet *</Label><Input id="athlete-nomComplet" required value={form.nomComplet} onChange={(e) => setForm({ ...form, nomComplet: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-sex">Sexe *</Label><Select required value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}><SelectTrigger id="athlete-sex"><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="athlete-dateDeNaissance">Date de naissance</Label><CompactDateInput id="athlete-dateDeNaissance" optional value={form.dateDeNaissance} onValueChange={dateDeNaissance => setForm(current => ({ ...current, dateDeNaissance }))} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-idNational">ID national</Label><Input id="athlete-idNational" value={form.idNational} onChange={(e) => setForm({ ...form, idNational: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-idFivb">ID FIVB</Label><Input id="athlete-idFivb" value={form.idFivb} onChange={(e) => setForm({ ...form, idFivb: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-lieuDeNaissance">Lieu de naissance</Label><Input id="athlete-lieuDeNaissance" value={form.lieuDeNaissance} onChange={(e) => setForm({ ...form, lieuDeNaissance: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-nationalite">Nationalité</Label><Input id="athlete-nationalite" value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-telephone">Téléphone</Label><Input id="athlete-telephone" type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="athlete-email">Adresse e-mail</Label><Input id="athlete-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="athlete-adresse">Adresse</Label><Input id="athlete-adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="athlete-observations">Observations</Label><Textarea id="athlete-observations" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></div>
              <AvatarFileField editing={editing} onFileChange={setAvatarFile} />
              <div className="space-y-2"><Label htmlFor="athlete-status">Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger id="athlete-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div>
            </div>
          ) : (
            <>
              <section className="space-y-4 border-t border-border/70 pt-4" aria-labelledby="athlete-identity-title">
                <h3 id="athlete-identity-title" className="flex items-center gap-3 text-base font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><UserRound className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">01</span>Identité civile</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="athlete-nomComplet">Nom complet *</Label><Input id="athlete-nomComplet" required value={form.nomComplet} onChange={(e) => setForm({ ...form, nomComplet: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="athlete-sex">Sexe *</Label><Select required value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}><SelectTrigger id="athlete-sex"><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="athlete-dateDeNaissance">Date de naissance</Label><CompactDateInput id="athlete-dateDeNaissance" optional value={form.dateDeNaissance} onValueChange={dateDeNaissance => setForm(current => ({ ...current, dateDeNaissance }))} /></div>
                  <div className="space-y-2"><Label htmlFor="athlete-lieuDeNaissance">Lieu de naissance</Label><Input id="athlete-lieuDeNaissance" value={form.lieuDeNaissance} onChange={(e) => setForm({ ...form, lieuDeNaissance: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="athlete-nationalite">Nationalité</Label><Input id="athlete-nationalite" value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Âge</Label><Input value={calculateAge(form.dateDeNaissance) === null ? "Calculé" : `${calculateAge(form.dateDeNaissance)} ans`} disabled /></div>
                </div>
              </section>

              <section className="space-y-4 border-t border-border/70 pt-4" aria-labelledby="athlete-contact-title">
                <h3 id="athlete-contact-title" className="flex items-center gap-3 text-base font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Contact className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">02</span>Contact</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="athlete-telephone">Téléphone</Label><Input id="athlete-telephone" type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="athlete-email">Adresse e-mail</Label><Input id="athlete-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="athlete-adresse">Adresse</Label><Input id="athlete-adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
                </div>
              </section>

              <section className="space-y-4 border-t border-border/70 pt-4" aria-labelledby="athlete-identifiers-title">
                <h3 id="athlete-identifiers-title" className="flex items-center gap-3 text-base font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Fingerprint className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">03</span>Identifiants</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="athlete-idNational">ID national</Label><Input id="athlete-idNational" value={form.idNational} onChange={(e) => setForm({ ...form, idNational: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="athlete-idFivb">ID FIVB</Label><Input id="athlete-idFivb" value={form.idFivb} onChange={(e) => setForm({ ...form, idFivb: e.target.value })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="athlete-status">Statut</Label><div className="flex items-center gap-3"><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger id="athlete-status" className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select><span className="text-sm text-muted-foreground">attribué par défaut</span></div></div>
                </div>
              </section>

              <section className="space-y-4 border-t border-border/70 pt-4" aria-labelledby="first-affiliation-title">
                <h3 id="first-affiliation-title" className="flex items-center gap-3 text-base font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><UsersRound className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">04</span>Première affiliation</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="registration-club">Club *</Label>
                    <SearchSelect
                      id="registration-club"
                      value={registration.clubId}
                      onValueChange={clubId => setRegistration(current => ({ ...current, clubId }))}
                      options={options?.clubs ?? []}
                      placeholder="Rechercher un club"
                      emptyMessage="Aucun club ne correspond à la recherche."
                      disabled={loadingOptions || !options}
                    />
                  </div>
                  <div className="space-y-2"><Label htmlFor="registration-date">Date de première affiliation *</Label><CompactDateInput id="registration-date" required value={registration.affiliationDate} onValueChange={affiliationDate => setRegistration(current => ({ ...current, affiliationDate }))} /></div>
                </div>
              </section>

              <section className="space-y-4 border-t border-border/70 pt-4" aria-labelledby="registration-licence-title">
                <h3 id="registration-licence-title" className="flex items-center gap-3 text-base font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Layers className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">05</span>Licence saisonnière</h3>
                <div className="space-y-2 md:w-1/2"><Label htmlFor="registration-season">Saison *</Label><Select required value={registration.seasonId} onValueChange={seasonId => { if (seasonId) setRegistration(current => ({ ...current, seasonId })) }} disabled={!options}><SelectTrigger id="registration-season"><SelectValue placeholder="Sélectionner la saison" /></SelectTrigger><SelectContent>{options?.seasons.map(season => <SelectItem key={season.id} value={season.id}>{season.label}</SelectItem>)}</SelectContent></Select></div>
                <p className="text-sm text-muted-foreground">Le numéro de licence sera attribué automatiquement après l’enregistrement.<br />Délivrance à la date de l’opération, heure de Kinshasa{options ? ` : ${initialDateValue(options.operationDate)}` : ""}</p>
              </section>

              <section className="space-y-4 border-t border-border/70 pt-4" aria-labelledby="athlete-extra-title">
                <h3 id="athlete-extra-title" className="flex items-center gap-3 text-base font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Info className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">06</span>Informations complémentaires</h3>
                <div className="space-y-4"><div className="space-y-2"><Label htmlFor="athlete-observations">Observations</Label><Textarea id="athlete-observations" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></div><AvatarFileField editing={editing} onFileChange={setAvatarFile} /></div>
              </section>
            </>
          )}
          </fieldset>
          {loadingOptions && <p role="status" className="text-sm text-muted-foreground">Chargement des clubs et saisons…</p>}
          {pending && <p role="status" aria-live="polite" className="text-sm">Enregistrement en cours…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {existingId && onViewExisting && <Button type="button" variant="outline" onClick={() => { changeOpen(false); onViewExisting(existingId) }}>Consulter la fiche existante</Button>}
          {recovery && <p role="status" className="text-sm">Une étape peut déjà être enregistrée. Reprenez cette tentative pour vérifier et terminer les relations ; aucune nouvelle identité ne sera demandée.</p>}
          {revision.error && <p role="alert" className="text-sm text-destructive">{revision.error}</p>}<SheetFooter><Button type="button" variant="outline" disabled={pending || recovery} onClick={() => changeOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || (editing && !revision.version) || (!editing && !recovery && (!options || loadingOptions))} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement..." : recovery ? "Reprendre l’enregistrement" : "Enregistrer"}</Button></SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
