"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Athlete } from "@/lib/types"

export function AthletesTable({
  athletes,
  activeLicenceNumbers,
  title = "Liste des Athlètes",
  emptyMessage = "Aucun athlète enregistré.",
  onViewAthlete,
}: {
  athletes: Athlete[]
  activeLicenceNumbers: Map<string, string>
  title?: string
  emptyMessage?: string
  onViewAthlete?: (athlete: Athlete) => void
}) {
  return (
    <ActorTable
      title={title}
      items={athletes}
      onView={onViewAthlete}
      showId={false}
      showCount={false}
      firstColumn={{ label: "Licence", value: (athlete) => activeLicenceNumbers.get(athlete.idAthlete) || "" }}
      stackSexAge
      emptyMessage={emptyMessage}
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
