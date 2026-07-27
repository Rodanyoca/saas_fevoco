"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import { Eye } from "lucide-react"
import { getActorAvatarUrl } from "@/lib/actor-avatar"

export interface ActorListRow {
  id: string
  nomComplet: string
  sexe: string
  dateNaissance: string
  idNational: string
  idFivb: string
  avatarDriveId: string
  avatarDriveUrl: string
  statut: string
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}

function sexeAge(row: ActorListRow) {
  const normalizedSexe = normalize(row.sexe)
  const sexe = normalizedSexe === "M" || normalizedSexe === "MASCULIN"
    ? "Masculin"
    : normalizedSexe === "F" || normalizedSexe === "FEMININ"
      ? "Féminin"
      : "Sexe non renseigné"
  const age = calculateAge(row.dateNaissance)
  return `${sexe} · ${age === null ? "Âge non renseigné" : `${age} ans`}`
}

export function ActorTable<T>({
  title,
  items,
  toRow,
  onView,
  emptyMessage,
  showId = true,
  firstColumn,
}: {
  title: string
  items: T[]
  toRow: (item: T) => ActorListRow
  onView?: (item: T) => void
  emptyMessage: string
  showId?: boolean
  firstColumn?: {
    label: string
    value: (item: T) => string
  }
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className={showId ? "min-w-[900px]" : "min-w-[820px]"}>
          <TableHeader>
            <TableRow>
              {firstColumn && <TableHead>{firstColumn.label}</TableHead>}
              {showId && <TableHead>ID</TableHead>}
              <TableHead>Avatar</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Sexe / Âge</TableHead>
              <TableHead>ID national</TableHead>
              <TableHead>ID FIVB</TableHead>
              <TableHead>Statut</TableHead>
              {onView && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const row = toRow(item)
              const imageUrl = getActorAvatarUrl(row.avatarDriveUrl, row.avatarDriveId)
              return (
                <TableRow key={`${row.id || "acteur"}-${index}`}>
                  {firstColumn && <TableCell className="font-mono">{firstColumn.value(item) || "Non renseigné"}</TableCell>}
                  {showId && <TableCell className="font-mono">{row.id || "Non renseigné"}</TableCell>}
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      {imageUrl && <AvatarImage src={imageUrl} alt={row.nomComplet || "Avatar"} />}
                      <AvatarFallback>{initials(row.nomComplet)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{row.nomComplet || "Non renseigné"}</TableCell>
                  <TableCell>{sexeAge(row)}</TableCell>
                  <TableCell className="font-mono">{row.idNational || "Non renseigné"}</TableCell>
                  <TableCell className="font-mono">{row.idFivb || "Non renseigné"}</TableCell>
                  <TableCell>
                    <Badge variant={["ACTIF", "ACTIVE"].includes(normalize(row.statut)) ? "default" : "secondary"}>
                      {row.statut || "Non renseigné"}
                    </Badge>
                  </TableCell>
                  {onView && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onView(item)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir le profil</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={(showId ? 7 : 6) + (onView ? 1 : 0) + (firstColumn ? 1 : 0)} className="h-24 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
