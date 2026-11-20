import { NextResponse } from "next/server"
export const runtime = "nodejs"
const retired = () => NextResponse.json({ code: "PARCOURS_RETIRE", message: "La licence accompagne le nouveau rattachement sportif. Utilisez les affiliations de la fiche athlète." }, { status: 410 })
export const GET = retired
export const POST = retired
