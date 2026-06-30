import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { QualiteClient } from "@/components/qualite/qualite-client"
import {
  getArbitres,
  getAthletes,
  getClubs,
  getCoachs,
  getCompetitionParticipants,
  getCompetitionResults,
  getCompetitions,
  getCompetitionUnites,
  getEntentes,
  getLigues,
  getMedecins,
  getOfficiels,
  getProvinces,
  getTransferts,
} from "@/lib/data"
import { createQualityStats } from "@/lib/quality"

export const runtime = "nodejs"

export default async function QualitePage() {
  const [
    provinces,
    ligues,
    ententes,
    clubs,
    athletes,
    coachs,
    arbitres,
    medecins,
    officiels,
    competitions,
    competitionParticipants,
    competitionUnites,
    competitionResults,
    transferts,
  ] = await Promise.all([
    getProvinces(),
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
    getCoachs(),
    getArbitres(),
    getMedecins(),
    getOfficiels(),
    getCompetitions(),
    getCompetitionParticipants(),
    getCompetitionUnites(),
    getCompetitionResults(),
    getTransferts(),
  ])

  const qualityStats = createQualityStats({
    provinces,
    ligues,
    ententes,
    clubs,
    athletes,
    coachs,
    arbitres,
    medecins,
    officiels,
    competitions,
    competitionParticipants,
    competitionUnites,
    competitionResults,
    transferts,
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Qualite des donnees</h1>
          <p className="mt-1 text-muted-foreground">
            Surveillez la completude des feuilles connectees a la FEVOCO.
          </p>
        </div>

        <QualiteClient stats={qualityStats} />
      </div>
    </DashboardLayout>
  )
}
