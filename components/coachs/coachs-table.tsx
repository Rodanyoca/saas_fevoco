"use client"

import { ActorTable } from "@/components/actors/actor-table"
import { licenceHistory } from "@/lib/actor-record-utils"
import type { BaseActorLicence, Coach } from "@/lib/types"

export function CoachsTable({ coachs, licences, onViewCoach }: { coachs: Coach[]; licences: BaseActorLicence[]; onViewCoach: (coach: Coach) => void }) {
  return (
    <ActorTable
      title="Liste des Coachs"
      items={coachs}
      onView={onViewCoach}
      showId={false}
      firstColumn={{
        label: "Numéro de licence",
        value: (coach) => licenceHistory(licences, coach.idCoach)[0]?.numeroLicence ?? "",
      }}
      emptyMessage="Aucun coach enregistré."
      toRow={(item) => ({
        id: item.idCoach, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  )
}
