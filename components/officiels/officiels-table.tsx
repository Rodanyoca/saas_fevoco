"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Officiel } from "@/lib/types"

export function OfficielsTable({ officiels, onViewOfficiel }: { officiels: Officiel[]; onViewOfficiel: (item: Officiel) => void }) {
  return (
    <ActorTable
      title={`Liste des officiels (${officiels.length})`}
      items={officiels}
      onView={onViewOfficiel}
      showId={false}
      emptyMessage="Aucun officiel enregistré."
      toRow={(item) => ({
        id: item.idOfficiel, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  )
}
