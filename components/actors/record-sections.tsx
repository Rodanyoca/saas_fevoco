"use client"

import { Badge } from "@/components/ui/badge"
import { formatSheetDate } from "@/lib/date-utils"
import {
  affiliationHistory,
  getCurrentAffiliationForActor,
  licenceHistory,
} from "@/lib/actor-record-utils"
import type { AthleteAffiliation, BaseActorAffiliation, BaseActorLicence } from "@/lib/types"

const value = (text: string) => text?.trim() || "Non renseigné"
const date = (text: string) => {
  const formatted = formatSheetDate(text)
  return formatted === "-" ? "Non renseignée" : formatted
}

export function ActorStatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase()
  const valid = ["ACTIF", "ACTIVE", "VALIDE", "VALIDEE", "EN COURS"].includes(normalized)
  const warning = ["A RENOUVELER", "À RENOUVELER", "EN ATTENTE"].includes(normalized)
  return <Badge variant={valid ? "default" : warning ? "outline" : "secondary"}>{value(status)}</Badge>
}

function Fields({
  fields,
  className = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  fields: Array<[string, string]>
  className?: string
}) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {fields.map(([label, content]) => (
        <div key={label} className="rounded-lg border bg-background p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 break-words font-medium">{value(content)}</p>
        </div>
      ))}
    </div>
  )
}

export function AffiliationSection<T extends BaseActorAffiliation>({
  affiliations,
  actorId,
}: {
  affiliations: T[]
  actorId: string
}) {
  const history = affiliationHistory(affiliations, actorId)
  const current = getCurrentAffiliationForActor(affiliations, actorId)
  const athlete = current as AthleteAffiliation | undefined
  return (
    <section className="border-t pt-8">
      <div className="mb-5"><h2 className="text-lg font-semibold">Affiliation</h2><p className="text-sm text-muted-foreground">Situation actuelle et historique</p></div>
      {current ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/15 p-4">
            <div><p className="text-xs text-muted-foreground">Structure actuelle</p><p className="font-semibold">{value(athlete?.nomClubBeneficiaire || current.nomStructure)}</p></div>
            <ActorStatusBadge status={current.statutAffiliation} />
          </div>
          <Fields fields={[
            ["ID affiliation", current.idAffiliation],
            ["Début", date(current.dateDebut)],
            ["Fin", date(current.dateFin)],
            ...("saison" in current ? [["Saison", String(current.saison)]] as Array<[string, string]> : []),
            ...("typeAffiliation" in current ? [["Type", String(current.typeAffiliation)]] as Array<[string, string]> : []),
            ["Observation", current.observation],
          ]} />
        </div>
      ) : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune affiliation enregistrée.</p>}
      {history.length > 0 && (
        <div className="mt-6 space-y-2"><h3 className="text-sm font-semibold">Historique</h3>{history.map((item, index) => (
          <div key={item.idAffiliation || `${item.actorId}-${item.dateDebut}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
            <div><p className="font-medium">{value((item as unknown as AthleteAffiliation).nomClubBeneficiaire || item.nomStructure)}</p><p className="text-muted-foreground">{date(item.dateDebut)} — {date(item.dateFin)}</p></div>
            <ActorStatusBadge status={item.statutAffiliation} />
          </div>
        ))}</div>
      )}
    </section>
  )
}

export function LicenceSection({ licences, actorId }: { licences: BaseActorLicence[]; actorId: string }) {
  const history = licenceHistory(licences, actorId)
  const current = history.find((item) => {
    const end = Date.parse(item.dateFinValidite)
    return !item.dateFinValidite || (!Number.isNaN(end) && end >= Date.now())
  }) ?? history[0]
  return (
    <section className="border-t pt-8">
      <div className="mb-5"><h2 className="text-lg font-semibold">Licence</h2><p className="text-sm text-muted-foreground">Licence fédérale, validité et renouvellements</p></div>
      {current ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/15 p-4">
            <div><p className="text-xs text-muted-foreground">Numéro de licence</p><p className="font-semibold">{value(current.numeroLicence)}</p></div>
            <ActorStatusBadge status={current.statutLicence} />
          </div>
          <Fields
            className="sm:grid-cols-2 xl:grid-cols-4"
            fields={[
              ["ID licence", current.idLicence],
              ["Délivrée le", date(current.dateDelivrance)],
              ["Valable jusqu’au", date(current.dateFinValidite)],
              ["Licence précédente", current.numeroLicencePrecedente || current.idLicencePrecedente],
            ]}
          />
        </div>
      ) : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune licence enregistrée.</p>}
      {history.length > 0 && <div className="mt-6 space-y-2"><h3 className="text-sm font-semibold">Historique</h3>{history.map((item) => (
        <div key={item.idLicence} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <div><p className="font-medium">{value(item.numeroLicence)}</p><p className="text-muted-foreground">{date(item.dateDelivrance)} — {date(item.dateFinValidite)}</p></div>
          <ActorStatusBadge status={item.statutLicence} />
        </div>
      ))}</div>}
    </section>
  )
}
