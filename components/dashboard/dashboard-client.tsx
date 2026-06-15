"use client"

import type { Province } from "@/lib/types"
import { GenreChart } from "@/components/dashboard/genre-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsTable } from "@/components/dashboard/stats-table"

export interface DashboardActivity {
  id: string
  type: "athlete" | "club" | "ligue" | "entente"
  action: string
  date: string
  description: string
}

export function DashboardClient({
  provinces,
  activities,
  genreData,
}: {
  provinces: Province[]
  activities: DashboardActivity[]
  genreData: Array<{ genre: string; count: number }>
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <GenreChart data={genreData} />
        <RecentActivity activities={activities} />
      </div>

      <div className="lg:col-span-2">
        <StatsTable provinces={provinces} />
      </div>
    </div>
  )
}
