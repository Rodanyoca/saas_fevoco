"use client"

import { useEffect, useMemo, useState } from "react"
import type { BaseActorLicence, Officiel, OfficielAffiliation } from "@/lib/types"
import { OfficielsStats } from "@/components/officiels/officiels-stats"
import { OfficielsFilters } from "@/components/officiels/officiels-filters"
import { OfficielsTable } from "@/components/officiels/officiels-table"
import { OfficielDetail } from "@/components/officiels/officiel-detail"
import { OfficielFormDialog } from "@/components/officiels/officiel-form-dialog"
import type { SavedOfficiel } from "@/components/officiels/officiel-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"
import type { OfficielStructureOption } from "@/components/officiels/officiel-affiliation-form-dialog"

export function OfficielsClient({ officiels, affiliations, licences, sexes, structures, functions }: {
  officiels: Officiel[]
  affiliations: OfficielAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  structures: OfficielStructureOption[]
  functions: CoachReferenceOption[]
}) {
  const [rows, setRows] = useState(officiels)
  const [affiliationRows, setAffiliationRows] = useState(affiliations)
  const [licenceRows, setLicenceRows] = useState(licences)
  const [selectedOfficiel, setSelectedOfficiel] = useState<Officiel | null>(null)
  const [search, setSearch] = useState("")
  const [entite, setEntite] = useState("all")
  const [fonction, setFonction] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(officiels), [officiels])
  useEffect(() => setAffiliationRows(affiliations), [affiliations])
  useEffect(() => setLicenceRows(licences), [licences])

  const applySavedOfficiel = (saved: SavedOfficiel) => {
    setRows((current) => {
      const existing = current.find((officiel) => officiel.idOfficiel === saved.idOfficiel)
      const merged: Officiel = {
        avatarDriveId: "", avatarDriveUrl: "", fonction: "", entite: "", rattachement: "",
        dateNomination: "", dateFinMandat: "", equipeFederal: "",
        ...existing, ...saved, id: saved.idOfficiel, dateNaissance: saved.dateDeNaissance, genre: saved.sexe,
      }
      return existing
        ? current.map((officiel) => officiel.idOfficiel === saved.idOfficiel ? merged : officiel)
        : [merged, ...current]
    })
    setSelectedOfficiel((current) => current?.idOfficiel === saved.idOfficiel
      ? { ...current, ...saved, id: saved.idOfficiel, dateNaissance: saved.dateDeNaissance, genre: saved.sexe }
      : current)
  }

  const applyCreatedAffiliation = (affiliation: OfficielAffiliation, deactivatedId: string) => {
    setAffiliationRows((current) => [
      affiliation,
      ...current.map((item) => item.idAffiliation === deactivatedId
        ? { ...item, statutAffiliation: "inactif", dateFin: affiliation.dateDebut }
        : item),
    ])
  }

  const filteredOfficiels = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((officiel) => {
      if (entite !== "all" && officiel.entite !== entite) return false
      if (fonction !== "all" && officiel.fonction !== fonction) return false
      if (statut !== "all" && officiel.statut !== statut) return false

      if (term) {
        const licenceNumbers = licenceRows
          .filter((licence) => licence.actorId === officiel.idOfficiel)
          .map((licence) => licence.numeroLicence)
          .join(" ")
        const haystack = `${officiel.nomComplet} ${licenceNumbers}`.toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [entite, fonction, licenceRows, rows, search, statut])

  return (
    <div className="space-y-6">
      {selectedOfficiel ? (
        <OfficielDetail officiel={selectedOfficiel} affiliations={affiliationRows} licences={licenceRows} sexes={sexes} structures={structures} functions={functions} onAffiliationCreated={applyCreatedAffiliation} onLicenceCreated={(licence, deactivatedId) => setLicenceRows((current) => [licence, ...current.map((item) => item.idLicence === deactivatedId ? { ...item, statutLicence: "INACTIF" } : item)])} onUpdated={applySavedOfficiel} onBack={() => setSelectedOfficiel(null)} />
      ) : (
        <>
          <div className="flex justify-end"><OfficielFormDialog sexes={sexes} onSaved={applySavedOfficiel} /></div>
          <OfficielsStats officiels={rows} />
          <OfficielsFilters
            officiels={rows}
            search={search}
            entite={entite}
            fonction={fonction}
            statut={statut}
            onSearchChange={setSearch}
            onEntiteChange={setEntite}
            onFonctionChange={setFonction}
            onStatutChange={setStatut}
          />
          <OfficielsTable officiels={filteredOfficiels} licences={licenceRows} onViewOfficiel={setSelectedOfficiel} />
        </>
      )}
    </div>
  )
}
