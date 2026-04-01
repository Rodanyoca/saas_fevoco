"use client"

import { useMemo, useState } from "react"
import type { Ligue } from "@/lib/types"
import { LiguesFilters } from "@/components/ligues/ligues-filters"
import { LiguesTable } from "@/components/ligues/ligues-table"
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

export function LiguesClient({
  ligues,
}: {
  ligues: Ligue[]
}) {
  const [search, setSearch] = useState("")
  const [statut, setStatut] = useState("all")
  const [pageSize, setPageSize] = useState<"10" | "50" | "100">("10")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return ligues.filter((l) => {
      if (statut !== "all") {
        if (l.statut !== statut) return false
      }

      if (s) {
        const haystack = `${l.id} ${l.nom} ${l.provinceNom}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [ligues, search, statut])

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
        <LiguesFilters
          search={search}
          statut={statut}
          onSearchChange={(v) => {
            setSearch(v)
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

      <LiguesTable ligues={paginated} totalCount={filtered.length} />

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
