"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchSelect } from "@/components/ui/search-select"
import { AthleteTransfersPanel } from "@/components/athletes/athlete-transfers-panel"
import type { Athlete } from "@/lib/types"
export function TransfertFormDialog({ athletes, onChanged }: { athletes: Athlete[]; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false), [actor, setActor] = useState("")
  return <div className="w-full space-y-4"><div className="flex justify-end"><Button onClick={() => setOpen(value => !value)}>{open ? "Fermer la gestion des transferts" : "Gérer les transferts d’un athlète"}</Button></div>{open && <><SearchSelect id="transfer-athlete" value={actor} onValueChange={setActor} options={athletes.map(item => ({ id: item.idAthlete, label: item.nomComplet }))} placeholder="Rechercher un athlète" />{actor && <AthleteTransfersPanel key={actor} actorId={actor} onChanged={onChanged} />}</>}</div>
}
