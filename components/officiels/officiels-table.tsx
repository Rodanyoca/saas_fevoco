"use client"

import { ActorTable } from "@/components/actors/actor-table"
import { licenceHistory } from "@/lib/actor-record-utils"
import type { BaseActorLicence, Officiel } from "@/lib/types"

export function OfficielsTable({ officiels, licences, onViewOfficiel }: { officiels: Officiel[]; licences: BaseActorLicence[]; onViewOfficiel: (item: Officiel) => void }) {
  return (
    <ActorTable
      title={`Liste des officiels (${officiels.length})`}
      items={officiels}
      onView={onViewOfficiel}
      showId={false}
      firstColumn={{
        label: "Numéro de licence",
        value: (officiel) => licenceHistory(licences, officiel.idOfficiel)[0]?.numeroLicence ?? "",
      }}
      emptyMessage="Aucun officiel enregistré."
      toRow={(item) => ({
        id: item.idOfficiel, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  )
}
