"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { formatSheetDate } from "@/lib/date-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  affiliationHistory,
  getCurrentAffiliationForActor,
  licenceHistory,
} from "@/lib/actor-record-utils"
import type { AthleteAffiliation, AthleteLicence, BaseActorAffiliation, BaseActorLicence } from "@/lib/types"

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
  action,
  title = "Affiliation",
  description = "Situation actuelle et historique",
  currentDetail,
  fieldsClassName,
}: {
  affiliations: T[]
  actorId: string
  action?: ReactNode
  title?: string
  description?: string
  currentDetail?: (affiliation: T) => [string, string]
  fieldsClassName?: string
}) {
  const history = affiliationHistory(affiliations, actorId)
  const current = getCurrentAffiliationForActor(affiliations, actorId)
  const currentStructureName = current && "nomClubBeneficiaire" in current
    ? String(current.nomClubBeneficiaire ?? "")
    : current?.nomStructure ?? ""
  const detail: [string, string] = current && currentDetail
    ? currentDetail(current)
    : ["Observation", current?.observation ?? ""]
  return (
    <section className="border-t pt-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>{action}</div>
      {current ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/15 p-4">
            <div><p className="text-xs text-muted-foreground">Structure actuelle</p><p className="font-semibold">{value(currentStructureName)}</p></div>
            <ActorStatusBadge status={current.statutAffiliation} />
          </div>
          <Fields className={fieldsClassName} fields={[
            ["ID affiliation", current.idAffiliation],
            ["Début", date(current.dateDebut)],
            ["Fin", date(current.dateFin)],
            ...("saison" in current ? [["Saison", String(current.saison)]] as Array<[string, string]> : []),
            ...("typeAffiliation" in current ? [["Type", String(current.typeAffiliation)]] as Array<[string, string]> : []),
            detail,
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

export function LicenceSection({ licences, actorId, action, athlete = false, showCycle = false }: { licences: BaseActorLicence[]; actorId: string; action?: ReactNode; showId?: boolean; athlete?: boolean; showCycle?: boolean }) {
  const history = licenceHistory(licences, actorId)
  const headers = athlete ? ["Saison", "Numéro", "Structure", "Délivrée le", "Statut"]  : ["Numéro", "Délivrée le", "Validité", "Statut"]
  if (showCycle) headers.splice(1, 0, "Cycle")
  return (
    <Card className="min-w-0">
      <CardHeader className="items-start gap-4">
        <CardTitle>Historique des licences</CardTitle>
        {action && <div className="flex flex-wrap gap-2 [&>button]:bg-brand-gold [&>button]:text-[#071827] [&>button:hover]:bg-brand-gold/90">{action}</div>}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table aria-label="Historique des licences">
            <TableHeader className="bg-muted/50"><TableRow>{headers.map(header => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {history.length ? history.map(item => {
                const licence = item as AthleteLicence
                return <TableRow key={item.idLicence}>
                  {athlete && <TableCell>{value(licence.saison)}</TableCell>}
                  <TableCell className="font-mono font-medium">{value(item.numeroLicence)}</TableCell>
                  {showCycle && <TableCell>{value(item.cycleLicence || "")}</TableCell>}
                  {athlete && <TableCell>{value(licence.nomClub)}</TableCell>}
                  <TableCell>{date(item.dateDelivrance)}</TableCell>
                  {!athlete && <TableCell>{date(item.dateDebutValidite || item.dateDelivrance)} — {date(item.dateFinValidite)}</TableCell>}
                  <TableCell><StatusBadge status={item.statutLicence} /></TableCell>
                </TableRow>
              }) : <TableRow><TableCell colSpan={headers.length} className="h-24 text-center text-muted-foreground">Aucune licence enregistrée.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
