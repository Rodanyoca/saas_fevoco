"use client"

import { ActorTable } from "@/components/actors/actor-table"
import { licenceHistory } from "@/lib/actor-record-utils"
import type { Athlete, AthleteLicence } from "@/lib/types"

export function AthletesTable({
  athletes,
  licences,
  title = "Liste des Athlètes",
  onViewAthlete,
}: {
  athletes: Athlete[]
  licences?: AthleteLicence[]
  title?: string
  onViewAthlete?: (athlete: Athlete) => void
}) {
  return (
    <ActorTable
      title={title}
      items={athletes}
      onView={onViewAthlete}
      showId={false}
      firstColumn={licences ? {
        label: "Numéro de licence",
        value: (athlete) => licenceHistory(licences, athlete.idAthlete)[0]?.numeroLicence ?? "",
      } : undefined}
      emptyMessage="Aucun athlète enregistré."
      toRow={(item) => ({
        id: item.idAthlete,
        nomComplet: item.nomComplet,
        sexe: item.sexe,
        dateNaissance: item.dateDeNaissance,
        idNational: item.idNational,
        idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId,
        avatarDriveUrl: item.avatarDriveUrl,
        statut: item.statut,
      })}
    />
  )
}
