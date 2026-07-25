"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Athlete, Club } from "@/lib/types"
import type { Entente } from "@/lib/types"
import { ClubFormDialog } from "@/components/clubs/club-form-dialog"
import type { SavedClub } from "@/components/clubs/club-form-dialog"
import type { ClubReferenceOption } from "@/lib/club-references"
import { ArrowLeft, Calendar, Shield } from "lucide-react"

interface ClubDetailProps {
  club: Club
  athletes: Athlete[]
  ententes: Entente[]
  categories: ClubReferenceOption[]
  versions: ClubReferenceOption[]
  onBack: () => void
  onUpdated: (club: SavedClub) => void
}

function shown(value: unknown, fallback = "Non renseigné") {
  const text = value === null || value === undefined ? "" : String(value).trim()
  return text || fallback
}

export function ClubDetail({ club, athletes, ententes, categories, versions, onBack, onUpdated }: ClubDetailProps) {
  const formattedDate = formatSheetDate(club.dateAffiliationClub)
  const active = ["ACTIF", "ACTIVE"].includes(normalize(club.statut))
  const sections = [
    {
      title: "Identité du club",
      fields: [
        ["Identifiant", club.idClub],
        ["Nom du club", club.nomClub],
        ["Catégorie", club.categorie],
        ["Version", club.version],
      ],
    },
    {
      title: "Rattachement territorial",
      fields: [
        ["Identifiant de l’entente", club.idEntente],
        ["Nom de l’entente", club.nomEntente],
        ["Pseudo de l’entente", club.pseudoEntente],
        ["Identifiant de la ligue", club.idLigue],
        ["Nom de la ligue", club.nomLigue],
      ],
    },
    {
      title: "Affiliation et suivi",
      fields: [
        ["Date d’affiliation", formattedDate === "-" ? "Non renseignée" : formattedDate],
        ["Statut", club.statut],
        ["Observations", club.observations],
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour à la liste</span>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">{shown(club.nomClub, "Club")}</h1>
            <p className="font-mono text-sm text-muted-foreground">{shown(club.idClub)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClubFormDialog
            club={club}
            ententes={ententes}
            categories={categories}
            versions={versions}
            onSaved={onUpdated}
          />
          <Badge variant={active ? "default" : "secondary"}>{shown(club.statut)}</Badge>
        </div>
      </div>

      <Tabs defaultValue="informations" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1.5">
          <TabsTrigger className="min-h-11 w-full text-center" value="informations">
            Informations générales
          </TabsTrigger>
          <TabsTrigger className="min-h-11 w-full text-center" value="athletes">
            Athlètes ({athletes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informations">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid auto-rows-fr gap-4 lg:grid-cols-3">
              {sections.map((section) => (
                <div key={section.title} className="flex h-full min-h-[330px] flex-col overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                  </div>
                  <div className="flex flex-1 flex-col divide-y divide-border/60 px-4">
                    {section.fields.map(([label, value]) => (
                      <div key={label} className="flex flex-1 flex-col justify-center py-3">
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          {label === "Date d’affiliation" && <Calendar className="h-3.5 w-3.5" />}
                          {label}
                        </p>
                        <p className="mt-1 break-words font-medium">{shown(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="athletes">
          {athletes.length > 0 ? (
            <AthletesTable athletes={athletes} title={`Athlètes du club (${athletes.length})`} />
          ) : (
            <Card>
              <CardContent className="flex min-h-32 items-center justify-center p-6 text-center text-muted-foreground">
                Aucun athlète enregistré pour ce club.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
