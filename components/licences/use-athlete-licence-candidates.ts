"use client"
import { useEffect, useState } from "react"
import type { AthleteLicenceCandidate } from "@/lib/athlete-licence-creation"

export function useAthleteLicenceCandidates(open: boolean, club: string, season: string, date: string) {
  const [refresh, setRefresh] = useState(0)
  const key = open && club && season && date ? JSON.stringify([club, season, date, refresh]) : ""
  const [result, setResult] = useState<{ key: string; candidates: AthleteLicenceCandidate[]; error: string; conflicts: number } | null>(null)
  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    fetch("/api/licences/athletes?" + new URLSearchParams({ club, season, date }), { cache: "no-store", signal: controller.signal }).then(async response => {
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || "La vérification des licences est indisponible.")
      if (!Array.isArray(payload.candidates)) throw new Error("La liste des candidats n'a pas été confirmée.")
      if (!controller.signal.aborted) setResult({ key, candidates: payload.candidates, error: "", conflicts: (payload.conflicts || []).filter((item: { code: string }) => ["ATHLETE_RESERVE", "DELIVRANCE_RESERVEE", "RATTACHEMENT_AMBIGU"].includes(item.code)).length })
    }).catch(error => { if (!controller.signal.aborted) setResult({ key, candidates: [], error: error instanceof Error ? error.message : "Vérification indisponible.", conflicts: 0 }) })
    return () => controller.abort()
  }, [key, club, season, date])
  const current = result?.key === key ? result : null
  return { candidates: current?.candidates || [], loading: Boolean(key && !current), ready: Boolean(key && current && !current.error), error: current?.error || "", conflicts: current?.conflicts || 0, reload: () => setRefresh(value => value + 1) }
}
