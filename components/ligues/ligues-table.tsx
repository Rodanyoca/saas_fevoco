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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ligues } from "@/lib/data/demo-data"
import { MoreHorizontal, Eye, Pencil, Trash2, Building2 } from "lucide-react"

export function LiguesTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Liste des Ligues
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {ligues.length} ligues
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la Ligue</TableHead>
                <TableHead>Province</TableHead>
                <TableHead className="text-center">Ententes</TableHead>
                <TableHead className="text-center">Clubs</TableHead>
                <TableHead className="text-center">Athlètes</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ligues.map((ligue) => (
                <TableRow key={ligue.id}>
                  <TableCell className="font-medium">{ligue.nom}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {ligue.province}
                  </TableCell>
                  <TableCell className="text-center">{ligue.ententes}</TableCell>
                  <TableCell className="text-center">{ligue.clubs}</TableCell>
                  <TableCell className="text-center">{ligue.athletes}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={ligue.statut === "active" ? "default" : "secondary"}
                      className={
                        ligue.statut === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {ligue.statut === "active" ? "Active" : "Inactive"}
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
