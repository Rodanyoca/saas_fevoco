"use client"

import { ServiceUnavailable } from "@/components/dashboard/service-unavailable"

export default function CompetitionsError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ServiceUnavailable retry={retry} />
}
