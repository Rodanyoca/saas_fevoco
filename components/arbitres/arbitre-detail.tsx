"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Arbitre, BaseActorLicence } from "@/lib/types"
import { LicenceSection } from "@/components/actors/record-sections"
import { ArrowLeft } from "lucide-react"
import { ArbitreFormDialog } from "@/components/arbitres/arbitre-form-dialog"
import type { SavedArbitre } from "@/components/arbitres/arbitre-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"
import { ArbitreLicenceFormDialog } from "@/components/arbitres/arbitre-licence-form-dialog"

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

export function ArbitreDetail({ arbitre, licences, sexes, onLicenceCreated, onUpdated, onBack }: {
  arbitre: Arbitre
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  onLicenceCreated: (licence: BaseActorLicence, deactivatedLicenceId: string) => void
  onUpdated: (arbitre: SavedArbitre) => void
  onBack: () => void
}) {
  const avatarUrl = getActorAvatarUrl(arbitre.avatarDriveUrl, arbitre.avatarDriveId)
  const age = calculateAge(arbitre.dateDeNaissance)
  const birthDate = formatSheetDate(arbitre.dateDeNaissance)
  const affiliationDate = formatSheetDate(arbitre.dateAffiliation)
  const active = ["ACTIF", "ACTIVE"].includes(normalize(arbitre.statut))
  const generalSections = [
    {
      title: "Identifiants",
      fields: [
        ["ID arbitre", arbitre.idArbitre],
        ["ID national", arbitre.idNational],
        ["ID FIVB", arbitre.idFivb],
      ],
    },
    {
      title: "État civil et profil",
      fields: [
        ["Date de naissance", birthDate === "-" ? "Non renseignée" : birthDate],
        ["Âge", age === null ? "Non renseigné" : `${age} ans`],
        ["Sexe", sexeLabel(arbitre.sexe)],
        ["Nationalité", arbitre.nationalite],
        ["Niveau", arbitre.niveau],
        ["Date d’affiliation", affiliationDate === "-" ? "Non renseignée" : affiliationDate],
      ],
    },
    {
      title: "Contact",
      fields: [
        ["Téléphone", arbitre.telephone],
        ["Adresse e-mail", arbitre.email],
        ["Adresse", arbitre.adresse],
      ],
    },
  ]

  return (
    <div className="w-full">
      <Button variant="ghost" className="mb-4" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux arbitres
      </Button>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="h-2 bg-primary" />
        <CardContent className="p-0">
          <header className="grid gap-6 border-b bg-muted/20 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={arbitre.nomComplet} />}
              <AvatarFallback className="text-2xl font-semibold">{initials(arbitre.nomComplet)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Profil arbitre</p>
              <h1 className="break-words text-2xl font-bold md:text-3xl">{shown(arbitre.nomComplet)}</h1>
              <p className="mt-2 font-mono text-sm text-muted-foreground">{shown(arbitre.idArbitre)}</p>
            </div>
            <div className="flex items-center gap-3">
              <ArbitreFormDialog arbitre={arbitre} sexes={sexes} onSaved={onUpdated} />
              <Badge variant={active ? "default" : "secondary"} className="w-fit">{shown(arbitre.statut)}</Badge>
            </div>
          </header>

          <div className="space-y-10 p-6 md:p-8">
            <section>
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Général</h2>
                <p className="text-sm text-muted-foreground">Identité et informations administratives</p>
              </div>

              <div className="grid auto-rows-fr gap-4 lg:grid-cols-3">
                {generalSections.map((section) => (
                  <div key={section.title} className="flex h-full min-h-72 flex-col overflow-hidden rounded-xl border bg-muted/10">
                    <div className="border-b bg-muted/30 px-5 py-3">
                      <h3 className="text-sm font-semibold">{section.title}</h3>
                    </div>
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

            <LicenceSection
              licences={licences}
              actorId={arbitre.idArbitre}
              showId={false}
              action={<ArbitreLicenceFormDialog arbitre={arbitre} onSaved={onLicenceCreated} />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
