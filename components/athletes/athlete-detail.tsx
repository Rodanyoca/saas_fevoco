"use client"
import { DeleteRecordButton } from "@/components/actors/record-management"

import { AffiliationsPanel } from "@/components/actors/affiliations-panel"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Athlete, AthleteLicence } from "@/lib/types"
import type { ActorAffiliationView } from "@/lib/actor-affiliation-schema"
import { formatDateForDisplay } from "@/lib/compact-date"
import { activeActorLicenceNumbers } from "@/lib/active-actor-licences"
import { LicenceSection } from "@/components/actors/record-sections"
import { ArrowLeft, ArrowLeftRight, BadgeCheck, Contact, Fingerprint, Info, UserRound } from "lucide-react"
import { AthleteFormDialog } from "@/components/athletes/athlete-form-dialog"
import type { SavedAthlete } from "@/components/athletes/athlete-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"

function shown(value: unknown, fallback = "Non renseigné") {
  const text = value === null || value === undefined ? "" : String(value).trim()
  return text || fallback
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}

function sexeLabel(value: string) {
  const sexe = normalize(value)
  if (sexe === "M" || sexe === "MASCULIN") return "Masculin"
  if (sexe === "F" || sexe === "FEMININ") return "Féminin"
  return shown(value)
}

export function AthleteDetail({ athlete, licences, sexes, onUpdated, onBack }: {
  athlete: Athlete
  licences: AthleteLicence[]
  sexes: ActorSexOption[]
  onUpdated: (athlete: SavedAthlete) => void
  onBack: () => void
}) {
  const [affiliations, setAffiliations] = useState<ActorAffiliationView[]>([])
  useEffect(() => setAffiliations([]), [athlete.idAthlete])
  const avatarUrl = getActorAvatarUrl(athlete.avatarDriveUrl, athlete.avatarDriveId)
  const age = calculateAge(athlete.dateDeNaissance)
  const dateNaissance = formatSheetDate(athlete.dateDeNaissance)
  const currentAffiliations = affiliations.filter(item => item.temporalState === "Actuel")
  const currentAffiliation = currentAffiliations.length === 1 ? currentAffiliations[0] : undefined
  const firstAffiliation = affiliations.reduce<ActorAffiliationView | undefined>((first, item) =>
    !first || item.dateDebut < first.dateDebut ? item : first, undefined)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
  const activeLicenceNumber = activeActorLicenceNumbers(licences, today).get(athlete.idAthlete)
  const currentAffiliationLabel = currentAffiliations.length > 1
    ? "Plusieurs affiliations actuelles à vérifier"
    : currentAffiliation?.structure || "Aucune affiliation active"

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        <div className="flex items-center gap-2">
          <div className="[&>button]:border-red-500/40 [&>button]:text-red-400 [&>button:hover]:border-red-500/70 [&>button:hover]:text-red-300">
            <DeleteRecordButton entity="actor" family="athlete" id={athlete.idAthlete} label={athlete.nomComplet} onDeleted={onBack} />
          </div>
          <AthleteFormDialog athlete={athlete} sexes={sexes} onSaved={onUpdated} />
        </div>
      </div>

      <Card className="border-border/70" data-testid="athlete-summary">
        <CardContent className="p-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Avatar className="size-16 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={athlete.nomComplet} />}
                <AvatarFallback className="text-lg">{initials(athlete.nomComplet)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-2xl font-bold uppercase">{shown(athlete.nomComplet)}</h1>
                  <StatusBadge status={athlete.statut} />
                </div>
                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">{shown(athlete.idAthlete)}</p>
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3 lg:min-w-[48%]">
                <div><dt className="text-xs text-muted-foreground">Club actuel</dt><dd className="break-words font-medium">{currentAffiliationLabel}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Licence active</dt><dd className="break-all font-mono font-medium">{shown(activeLicenceNumber, "Aucune licence active")}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Première affiliation</dt><dd className="font-medium">{firstAffiliation ? formatDateForDisplay(firstAffiliation.dateDebut) : "Non renseignée"}</dd></div>
              </dl>
          </div>
        </CardContent>
      </Card>

      <section className="border-t border-border/70 pt-3" aria-labelledby="athlete-detail-identity">
        <h2 id="athlete-detail-identity" className="mb-2 flex items-center gap-3 text-base font-semibold"><span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><UserRound className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">01</span>Identité civile</h2>
        <dl className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {[
            ["Nom complet", shown(athlete.nomComplet)],
            ["Sexe", sexeLabel(athlete.sexe)],
            ["Date de naissance", dateNaissance === "-" ? "Non renseignée" : dateNaissance],
            ["Lieu de naissance", shown(athlete.lieuNaissance)],
            ["Nationalité", shown(athlete.nationalite)],
            ["Âge", age === null ? "Non renseigné" : `${age} ans`],
          ].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-0.5"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}
        </dl>
      </section>

      <section className="border-t border-border/70 pt-3" aria-labelledby="athlete-detail-contact">
        <h2 id="athlete-detail-contact" className="mb-2 flex items-center gap-3 text-base font-semibold"><span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Contact className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">02</span>Contact</h2>
        <dl className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {[
            ["Téléphone", shown(athlete.telephone)],
            ["E-mail", shown(athlete.email)],
            ["Adresse", shown(athlete.adresse)],
          ].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-0.5"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}
        </dl>
      </section>

      <section className="border-t border-border/70 pt-3" aria-labelledby="athlete-detail-identifiers">
        <h2 id="athlete-detail-identifiers" className="mb-2 flex items-center gap-3 text-base font-semibold"><span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Fingerprint className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">03</span>Identifiants</h2>
        <dl className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {[
            ["ID athlète", shown(athlete.idAthlete)],
            ["ID national", shown(athlete.idNational)],
            ["ID FIVB", shown(athlete.idFivb)],
          ].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-0.5"><dt className="text-muted-foreground">{label}</dt><dd><span className="break-all font-mono font-medium">{value}</span></dd></div>)}
        </dl>
      </section>

      <section className="border-t border-border/70 pt-3" aria-labelledby="athlete-detail-extra">
        <h2 id="athlete-detail-extra" className="mb-2 flex items-center gap-3 text-base font-semibold"><span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><Info className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">04</span>Informations complémentaires</h2>
        <dl className="grid gap-x-8 gap-y-1 md:grid-cols-2"><div className="grid grid-cols-2 gap-3 py-0.5"><dt className="text-muted-foreground">Observations</dt><dd className="break-words font-medium">{shown(athlete.observations)}</dd></div></dl>
      </section>

      <section className="border-t border-border/70 pt-5" aria-labelledby="athlete-detail-transfers">
        <h2 id="athlete-detail-transfers" className="mb-4 flex items-center gap-3 text-lg font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><ArrowLeftRight className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">06</span>Historique des transferts</h2>
        <AffiliationsPanel kind="athlete" actorId={athlete.idAthlete} onAffiliationsLoaded={setAffiliations} />
      </section>

      <section className="border-t border-border/70 pt-5" aria-labelledby="athlete-detail-licences">
        <h2 id="athlete-detail-licences" className="mb-4 flex items-center gap-3 text-lg font-semibold"><span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40"><BadgeCheck className="size-4" /></span><span className="font-mono text-sm text-muted-foreground">07</span>Historique des licences</h2>
        <LicenceSection licences={licences} actorId={athlete.idAthlete} athlete />
      </section>
    </div>
  )
}
