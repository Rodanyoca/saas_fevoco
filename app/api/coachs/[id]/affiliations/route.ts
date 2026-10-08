import { NextResponse } from "next/server"
import { POST as createAffiliation } from "@/app/api/affiliations/[kind]/route"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  let body: Record<string, unknown>
  try { body = await request.json(); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error() } catch { return NextResponse.json({ message: "Requ?te invalide." }, { status: 400 }) }
  return createAffiliation(new Request(request.url, { method: "POST", headers: request.headers, body: JSON.stringify({ ...body, actorId: decodeURIComponent(id) }) }), { params: Promise.resolve({ kind: "coach" }) })
}
