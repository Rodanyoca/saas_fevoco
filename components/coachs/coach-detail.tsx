"use client"

import { AffiliationsPanel } from "@/components/actors/affiliations-panel"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Coach } from "@/lib/types"
import { LicenceSection } from "@/components/actors/record-sections"
import { ArrowLeft, Contact, Fingerprint, Info, UserCog } from "lucide-react"
import { CoachFormDialog } from "@/components/coachs/coach-form-dialog"
import type { SavedCoach } from "@/components/coachs/coach-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"

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

export function CoachDetail({ coach, licences, sexes, levels, onUpdated, onBack }: {
  coach: Coach
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  levels: CoachReferenceOption[]
  onUpdated: (coach: SavedCoach) => void
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const avatarUrl = getActorAvatarUrl(coach.avatarDriveUrl, coach.avatarDriveId)
  const age = calculateAge(coach.dateNaissance)
  const formattedDate = formatSheetDate(coach.dateNaissance)

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        {activeTab === "general" && <CoachFormDialog coach={coach} sexes={sexes} levels={levels} onSaved={onUpdated} />}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-20 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={coach.nomComplet} />}
                <AvatarFallback className="text-lg">{initials(coach.nomComplet)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-bold">{shown(coach.nomComplet)}</h2>
                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">{shown(coach.idCoach)}</p>
              </div>
            </div>
            <StatusBadge status={coach.statut} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="general" className="w-full">Général</TabsTrigger>
          <TabsTrigger value="affiliation" className="w-full">Affiliations</TabsTrigger>
          <TabsTrigger value="licence" className="w-full">Licence</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <DetailCard
              title="Identité"
              icon={UserCog}
              fields={[
                { label: "ID", value: coach.idCoach },
                { label: "Nom complet", value: coach.nomComplet },
                { label: "Sexe", value: sexeLabel(coach.sexe) },
                { label: "Date de naissance", value: formattedDate === "-" ? "—" : formattedDate },
                { label: "Âge", value: age === null ? "—" : `${age} ans` },
                { label: "Lieu de naissance", value: coach.lieuNaissance },
                { label: "Nationalité", value: coach.nationalite },
                { label: "Niveau", value: coach.niveau },
              ]}
            />
            <DetailCard
              title="Contact"
              icon={Contact}
              fields={[
                { label: "Téléphone", value: coach.telephone },
                { label: "E-mail", value: coach.email },
                { label: "Adresse", value: coach.adresse },
              ]}
            />
            <DetailCard
              title="Identifiants"
              icon={Fingerprint}
              fields={[
                { label: "ID entraîneur", value: coach.idCoach },
                { label: "ID national", value: coach.idNational },
                { label: "ID FIVB", value: coach.idFivb },
                { label: "Statut", value: coach.statut },
              ]}
            />
            <DetailCard
              title="Remarque"
              icon={Info}
              fields={[{ label: "Remarque", value: "Non renseignée" }]}
            />
          </div>
        </TabsContent>

        <TabsContent value="affiliation" className="space-y-8 [&_section:first-of-type]:border-t-0 [&_section:first-of-type]:pt-0">
          <AffiliationsPanel kind="coach" actorId={coach.idCoach} />
        </TabsContent>

        <TabsContent value="licence" className="[&>section]:border-t-0 [&>section]:pt-0">
          <LicenceSection
            licences={licences}
            actorId={coach.idCoach}
            showId={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
