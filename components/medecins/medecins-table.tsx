"use client"

import { ActorTable } from "@/components/actors/actor-table"
import { licenceHistory } from "@/lib/actor-record-utils"
import type { BaseActorLicence, Medecin } from "@/lib/types"

export function MedecinsTable({ medecins, licences, onViewMedecin }: { medecins: Medecin[]; licences: BaseActorLicence[]; onViewMedecin: (item: Medecin) => void }) {
  return (
    <ActorTable
      title={`Liste des médecins (${medecins.length})`}
      items={medecins}
      onView={onViewMedecin}
      showId={false}
      firstColumn={{
        label: "Numéro de licence",
        value: (medecin) => licenceHistory(licences, medecin.idMedecin)[0]?.numeroLicence ?? "",
      }}
      emptyMessage="Aucun médecin enregistré."
      toRow={(item) => ({
        id: item.idMedecin, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  )
}
