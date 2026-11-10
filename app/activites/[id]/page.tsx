import { getUnavailableModule } from "@/lib/module-availability"
import { ComingSoonPage } from "@/components/dashboard/coming-soon-page"
import { notFound } from "next/navigation"
import { ActivityDetail } from "@/components/activities/activity-detail"
import { loadActivityDetail } from "@/lib/activities"
export const runtime="nodejs"
export const dynamic="force-dynamic"
export default async function ActivityPage({params}:{params:Promise<{id:string}>}){
  const unavailable = getUnavailableModule("/activites")
  if (unavailable) return <ComingSoonPage {...unavailable} />
const{id}=await params,detail=await loadActivityDetail(id);if(!detail)notFound();return <ActivityDetail detail={detail}/>}
