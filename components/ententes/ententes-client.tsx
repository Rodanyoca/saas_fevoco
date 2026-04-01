"use client"

import { useMemo, useState } from "react"
import type { Entente } from "@/lib/types"
import { EntentesFilters } from "@/components/ententes/ententes-filters"
import { EntentesTable } from "@/components/ententes/ententes-table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EntentesClient({ ententes }: { ententes: Entente[] }) {
  const [search, setSearch] = useState("")
  const [ligue, setLigue] = useState("all")
  const [statut, setStatut] = useState("all")
  const [pageSize, setPageSize] = useState<"10" | "50" | "100">("10")
  const [page, setPage] = useState(1)

  const liguesOptions = useMemo(() => {
    return Array.from(new Set(ententes.map((e) => e.ligueNom).filter(Boolean)))
  }, [ententes])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return ententes.filter((e) => {
      if (ligue !== "all" && e.ligueNom !== ligue) return false
      if (statut !== "all" && e.statut !== statut) return false

      if (s) {
        const haystack = `${e.id} ${e.nom} ${e.pseudo} ${e.provinceNom} ${e.ligueNom}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [ententes, ligue, search, statut])

  const pageSizeNumber = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNumber))
  const currentPage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSizeNumber
    return filtered.slice(start, start + pageSizeNumber)
  }, [currentPage, filtered, pageSizeNumber])

  const goToPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages)
    setPage(clamped)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <EntentesFilters
          search={search}
          ligue={ligue}
          statut={statut}
          ligues={liguesOptions}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          onLigueChange={(v) => {
            setLigue(v)
            setPage(1)
          }}
          onStatutChange={(v) => {
            setStatut(v)
            setPage(1)
          }}
        />

        <div className="flex items-center justify-end">
          <Select
            value={pageSize}
            onValueChange={(v) => {
              setPageSize(v as "10" | "50" | "100")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Affichage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 éléments</SelectItem>
              <SelectItem value="50">50 éléments</SelectItem>
              <SelectItem value="100">100 éléments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EntentesTable ententes={paginated} totalCount={filtered.length} />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                goToPage(currentPage - 1)
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
            const p = idx + 1
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    goToPage(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                goToPage(currentPage + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
