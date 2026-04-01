import { NextResponse } from "next/server"
import { getLigues } from "@/lib/data"

export const runtime = "nodejs"

export async function GET() {
  try {
    const ligues = await getLigues()
    return NextResponse.json({ ligues })
  } catch {
    return NextResponse.json({ ligues: [] }, { status: 500 })
  }
}
