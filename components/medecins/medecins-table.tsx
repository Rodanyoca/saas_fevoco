"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Medecin } from "@/lib/types"

export function MedecinsTable({ medecins, onViewMedecin }: { medecins: Medecin[]; onViewMedecin: (item: Medecin) => void }) {
  return (
    <ActorTable
      title={`Liste des médecins (${medecins.length})`}
      items={medecins}
      onView={onViewMedecin}
      showId={false}
      emptyMessage="Aucun médecin enregistré."
      toRow={(item) => ({
        id: item.idMedecin, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  )
}
