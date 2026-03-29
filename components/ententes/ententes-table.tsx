"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ententes } from "@/lib/data/demo-data"
import { MoreHorizontal, Eye, Pencil, Trash2, Network, Phone, User } from "lucide-react"

export function EntentesTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Liste des Ententes
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {ententes.length} ententes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l&apos;Entente</TableHead>
                <TableHead>Ligue</TableHead>
                <TableHead>Province</TableHead>
                <TableHead className="text-center">Clubs</TableHead>
                <TableHead className="text-center">Athlètes</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ententes.map((entente) => (
                <TableRow key={entente.id}>
                  <TableCell className="font-medium">{entente.nom}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {entente.ligue}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entente.province}
                  </TableCell>
                  <TableCell className="text-center">{entente.clubs}</TableCell>
                  <TableCell className="text-center">{entente.athletes}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {entente.responsable}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {entente.telephone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={entente.statut === "active" ? "default" : "secondary"}
                      className={
                        entente.statut === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {entente.statut === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
