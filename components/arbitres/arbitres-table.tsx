"use client"

import { ActorTable } from "@/components/actors/actor-table"
import { licenceHistory } from "@/lib/actor-record-utils"
import type { Arbitre, BaseActorLicence } from "@/lib/types"

export function ArbitresTable({ arbitres, licences, onViewArbitre }: { arbitres: Arbitre[]; licences: BaseActorLicence[]; onViewArbitre: (item: Arbitre) => void }) {
  return (
    <ActorTable
      title={`Liste des arbitres (${arbitres.length})`}
      items={arbitres}
      onView={onViewArbitre}
      showId={false}
      firstColumn={{
        label: "Numéro de licence",
        value: (arbitre) => licenceHistory(licences, arbitre.idArbitre)[0]?.numeroLicence ?? "",
      }}
      emptyMessage="Aucun arbitre enregistré."
      toRow={(item) => ({
        id: item.idArbitre, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  )
}
