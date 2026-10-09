"use client"

import { AffiliationsPanel } from "@/components/actors/affiliations-panel"

import { useState } from "react"
import { ArrowLeft, Contact, Fingerprint, Flag, MessageSquareText } from "lucide-react"
import { LicenceSection } from "@/components/actors/record-sections"
import type { OfficielStructureOption } from "@/components/officiels/officiel-affiliation-form-dialog"
import { OfficielFormDialog, type SavedOfficiel } from "@/components/officiels/officiel-form-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { formatDateForDisplay } from "@/lib/compact-date"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Officiel, OfficielAffiliation } from "@/lib/types"

const shown = (value: unknown) => String(value ?? "").trim() || "Non renseigné"
const initials = (name: string) => { const p = name.trim().split(/\s+/).filter(Boolean); return p.length ? `${p[0]?.[0] ?? ""}${p.at(-1)?.[0] ?? ""}`.toUpperCase() : "OF" }
const sexeLabel = (value: string) => { const v = normalize(value); return v === "M" || v === "MASCULIN" ? "Masculin" : v === "F" || v === "FEMININ" ? "Féminin" : shown(value) }

export function OfficielDetail({ officiel, licences, sexes, onUpdated, onBack }: {
  officiel: Officiel; affiliations: OfficielAffiliation[]; licences: BaseActorLicence[]; sexes: ActorSexOption[]
  structures: OfficielStructureOption[]; functions: CoachReferenceOption[]; structureTypes: CoachReferenceOption[]; seasons: CoachReferenceOption[]
  onAffiliationCreated: (item: OfficielAffiliation, deactivatedId: string) => void;
  onUpdated: (item: SavedOfficiel) => void; onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const avatarUrl = getActorAvatarUrl(officiel.avatarDriveUrl, officiel.avatarDriveId)
  const age = calculateAge(officiel.dateDeNaissance)
  const hasPassport = Boolean(officiel.numeroPasseport || officiel.dateDelivrancePasseport || officiel.dateExpirationPasseport)

  return <div className="w-full space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button>{activeTab === "general" && <OfficielFormDialog officiel={officiel} sexes={sexes} onSaved={onUpdated} />}</div>
    <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><Avatar className="size-20 shrink-0">{avatarUrl && <AvatarImage src={avatarUrl} alt={officiel.nomComplet} />}<AvatarFallback className="text-lg">{initials(officiel.nomComplet)}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="break-words text-2xl font-bold">{shown(officiel.nomComplet)}</h2><p className="mt-1 text-muted-foreground">{shown(officiel.idNational || officiel.idOfficiel)}</p><div className="mt-2"><StatusBadge status={officiel.statut} /></div></div></div><div className="text-right"><p className="text-sm text-muted-foreground">Code Officiel</p><p className="font-mono font-medium">{shown(officiel.idOfficiel)}</p></div></div></CardContent></Card>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
      <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="general">Général</TabsTrigger><TabsTrigger value="mandats">Affiliations</TabsTrigger><TabsTrigger value="licences">Licences</TabsTrigger></TabsList>
      <TabsContent value="general"><div className="grid w-full gap-6 md:grid-cols-2">
        <DetailCard title="Identité" icon={Flag} fields={[{label:"ID officiel",value:officiel.idOfficiel},{label:"Nom complet",value:officiel.nomComplet},{label:"Sexe",value:sexeLabel(officiel.sexe)},{label:"Date de naissance",value:formatDateForDisplay(officiel.dateDeNaissance)||"Non renseignée"},{label:"Âge",value:age===null?"Non renseigné":`${age} ans`},{label:"Lieu de naissance",value:officiel.lieuNaissance},{label:"Nationalité",value:officiel.nationalite}]} />
        <DetailCard title="Contact" icon={Contact} fields={[{label:"Téléphone",value:officiel.telephone},{label:"E-mail",value:officiel.email},{label:"Adresse",value:officiel.adresse}]} />
        <DetailCard title="Identifiants" icon={Fingerprint} fields={[{label:"ID national",value:officiel.idNational},{label:"ID FIVB",value:officiel.idFivb},{label:"Statut",value:officiel.statut},...(hasPassport ? [{label:"Passeport",value:officiel.numeroPasseport},{label:"Date de d\u00e9livrance",value:formatDateForDisplay(officiel.dateDelivrancePasseport)},{label:"Date d'expiration",value:formatDateForDisplay(officiel.dateExpirationPasseport)}] : [])]} />
        <DetailCard title="Observations" icon={MessageSquareText} fields={[{label:"Notes",value:shown(officiel.observations)}]} />
      </div></TabsContent>
      <TabsContent value="mandats"><AffiliationsPanel kind="officiel" actorId={officiel.idOfficiel} /></TabsContent>
      <TabsContent value="licences" className="[&>section]:border-t-0 [&>section]:pt-0"><LicenceSection licences={licences} actorId={officiel.idOfficiel} showId={false} showCycle /></TabsContent>
    </Tabs>
  </div>
}
