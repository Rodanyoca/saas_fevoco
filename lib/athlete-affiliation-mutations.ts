import "server-only"

import { env } from "@/lib/env"
import { getTransferTypes } from "@/lib/actor-references"
import { getAthleteAffiliations } from "@/lib/actor-records"
import { getAthletes, getClubs } from "@/lib/data"
import { appendSheetRecord } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()
const statuses = new Set(["actif", "inactif", "active", "inactive", "en attente"])

function seasonYear(saison: string) {
  const match = saison.match(/\b(20\d{2})\b/)
  if (!match) throw new Error("La saison doit contenir une année, par exemple 2026 ou 2026-2027.")
  return match[1]
}

function nextAffiliationId(existing: { idAffiliation: string; saison: string }[], saison: string) {
  const year = seasonYear(saison)
  const pattern = new RegExp(`^ATH\\.AFF-(\\d+)\\/${year}$`, "i")
  const max = existing.reduce((highest, item) => {
    const match = item.idAffiliation.match(pattern)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `ATH.AFF-${String(max + 1).padStart(4, "0")}/${year}`
}

type Input = {
  saison: string; typeAffiliation: string; idAthlete: string
  idClubOrigine: string; idClubBeneficiaire: string
  dateDebut: string; dateFin: string; statutAffiliation: string; observation: string
}

function parse(payload: Record<string, unknown>): Input {
  return {
    saison: text(payload.saison), typeAffiliation: text(payload.typeAffiliation),
    idAthlete: text(payload.idAthlete), idClubOrigine: text(payload.idClubOrigine),
    idClubBeneficiaire: text(payload.idClubBeneficiaire), dateDebut: text(payload.dateDebut),
    dateFin: text(payload.dateFin), statutAffiliation: text(payload.statutAffiliation).toLowerCase() || "actif",
    observation: text(payload.observation),
  }
}

export async function createAthleteAffiliation(payload: Record<string, unknown>) {
  const input = parse(payload)
  if (!input.saison) throw new Error("La saison est obligatoire.")
  if (!input.typeAffiliation) throw new Error("Le type d’affiliation est obligatoire.")
  if (!input.idAthlete) throw new Error("L’athlète est obligatoire.")
  if (!input.idClubBeneficiaire) throw new Error("Le club bénéficiaire est obligatoire.")
  if (!statuses.has(input.statutAffiliation)) throw new Error("Le statut est invalide.")

  const type = normalize(input.typeAffiliation)
  const firstAffiliation = type.includes("PREMIERE") && type.includes("AFFILIATION")
  const temporary = type.includes("TEMPORAIRE")
  if (!firstAffiliation && !input.idClubOrigine) throw new Error("Le club d’origine est obligatoire pour ce type.")
  if (!input.dateDebut) throw new Error("La date de début est obligatoire.")
  if (temporary && !input.dateFin) throw new Error("La date de fin est obligatoire pour un transfert temporaire.")
  if (temporary && input.dateFin < input.dateDebut) throw new Error("La date de fin doit être postérieure à la date de début.")
  if (!temporary) input.dateFin = ""
  if (firstAffiliation) input.idClubOrigine = ""
  if (input.idClubOrigine && input.idClubOrigine === input.idClubBeneficiaire) throw new Error("Les clubs d’origine et bénéficiaire doivent être différents.")

  const [types, athletes, clubs, affiliations] = await Promise.all([
    getTransferTypes(), getAthletes(), getClubs(), getAthleteAffiliations(),
  ])
  if (types.length && !types.some((option) => option.nom === input.typeAffiliation)) throw new Error("Le type d’affiliation sélectionné est invalide.")
  const athlete = athletes.find((item) => item.idAthlete === input.idAthlete)
  if (!athlete) throw new Error("Athlète introuvable.")
  const origin = input.idClubOrigine ? clubs.find((item) => item.idClub === input.idClubOrigine) : undefined
  const beneficiary = clubs.find((item) => item.idClub === input.idClubBeneficiaire)
  if (input.idClubOrigine && !origin) throw new Error("Club d’origine introuvable.")
  if (!beneficiary) throw new Error("Club bénéficiaire introuvable.")

  const idAffiliation = nextAffiliationId(affiliations, input.saison)
  await appendSheetRecord(env.googleSheets.affiliationsSpreadsheetId, "ATHLETE_AFFILIATIONS", {
    id_affiliation: idAffiliation, saison: input.saison, type_affiliation: input.typeAffiliation,
    id_athlete: athlete.idAthlete, nom_athlete: athlete.nomComplet,
    id_club_origine: origin?.idClub ?? "", nom_club_origine: origin?.nomClub ?? "",
    id_club_beneficiaire: beneficiary.idClub, nom_club_beneficiaire: beneficiary.nomClub,
    date_debut: input.dateDebut, date_fin: input.dateFin,
    statut_affiliation: input.statutAffiliation, observation: input.observation,
  })
  return {
    id: idAffiliation, athleteId: athlete.idAthlete, athleteNom: athlete.nomComplet,
    clubOrigineId: origin?.idClub ?? "", clubOrigineNom: origin?.nomClub ?? "",
    clubBeneficiaireId: beneficiary.idClub, clubBeneficiaireNom: beneficiary.nomClub,
    typeTransfert: input.typeAffiliation, saison: input.saison, statut: input.statutAffiliation,
    dateValidation: input.dateDebut, dateDebut: input.dateDebut, dateFin: input.dateFin,
    observation: input.observation,
  }
}
