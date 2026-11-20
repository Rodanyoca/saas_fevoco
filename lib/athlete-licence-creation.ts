import "server-only"
import { mutateSeasonalLicence } from "@/lib/sports-mutations"
export const updateAthleteLicence = async (id: string, input: unknown) => (await mutateSeasonalLicence(input, id))[0]
