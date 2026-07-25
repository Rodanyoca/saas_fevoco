"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Officiel, OfficielAffiliation } from "@/lib/types"
import { AffiliationSection, LicenceSection } from "@/components/actors/record-sections"
import { ArrowLeft } from "lucide-react"
import { OfficielFormDialog } from "@/components/officiels/officiel-form-dialog"
import type { SavedOfficiel } from "@/components/officiels/officiel-form-dialog"
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

export function OfficielDetail({ officiel, affiliations, licences, sexes, onUpdated, onBack }: {
  officiel: Officiel
  affiliations: OfficielAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  onUpdated: (officiel: SavedOfficiel) => void
  onBack: () => void
}) {
  const avatarUrl = getActorAvatarUrl(officiel.avatarDriveUrl, officiel.avatarDriveId)
  const age = calculateAge(officiel.dateDeNaissance)
  const formattedDate = formatSheetDate(officiel.dateDeNaissance)
  const active = ["ACTIF", "ACTIVE"].includes(normalize(officiel.statut))
  const sections = [
    {
      title: "Identifiants",
      fields: [
        ["ID officiel", officiel.idOfficiel],
        ["ID national", officiel.idNational],
        ["ID FIVB", officiel.idFivb],
      ],
    },
    {
      title: "État civil",
      fields: [
        ["Date de naissance", formattedDate === "-" ? "Non renseignée" : formattedDate],
        ["Âge", age === null ? "Non renseigné" : `${age} ans`],
        ["Sexe", sexeLabel(officiel.sexe)],
        ["Nationalité", officiel.nationalite],
      ],
    },
    {
      title: "Contact",
      fields: [
        ["Téléphone", officiel.telephone],
        ["Adresse e-mail", officiel.email],
        ["Adresse", officiel.adresse],
      ],
    },
  ]

  return (
    <div className="w-full">
      <Button variant="ghost" className="mb-4" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux officiels
      </Button>
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="h-2 bg-primary" />
        <CardContent className="p-0">
          <header className="grid gap-6 border-b bg-muted/20 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={officiel.nomComplet} />}
              <AvatarFallback className="text-2xl font-semibold">{initials(officiel.nomComplet)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Profil officiel</p>
              <h1 className="break-words text-2xl font-bold md:text-3xl">{shown(officiel.nomComplet)}</h1>
              <p className="mt-2 font-mono text-sm text-muted-foreground">{shown(officiel.idOfficiel)}</p>
            </div>
            <div className="flex items-center gap-3">
              <OfficielFormDialog officiel={officiel} sexes={sexes} onSaved={onUpdated} />
              <Badge variant={active ? "default" : "secondary"} className="w-fit">{shown(officiel.statut)}</Badge>
            </div>
          </header>
          <div className="space-y-10 p-6 md:p-8">
            <section>
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Général</h2>
                <p className="text-sm text-muted-foreground">Identité et informations administratives</p>
              </div>
              <div className="grid auto-rows-fr gap-4 lg:grid-cols-3">
                {sections.map((section) => (
                  <div key={section.title} className="flex h-full min-h-72 flex-col overflow-hidden rounded-xl border bg-muted/10">
                    <div className="border-b bg-muted/30 px-5 py-3"><h3 className="text-sm font-semibold">{section.title}</h3></div>
                    <div className="flex flex-1 flex-col divide-y px-5">
                      {section.fields.map(([label, value]) => (
                        <div key={label} className="flex flex-1 flex-col justify-center py-3">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="mt-1 break-words font-medium">{shown(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <AffiliationSection affiliations={affiliations} actorId={officiel.idOfficiel} />
            <LicenceSection licences={licences} actorId={officiel.idOfficiel} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
