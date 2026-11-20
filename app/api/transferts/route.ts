import { NextResponse } from "next/server"
import { POST as createAffiliation } from "@/app/api/affiliations/[kind]/route"
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json(); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error() } catch { return NextResponse.json({message:"Requête invalide."},{status:400}) }
  return createAffiliation(new Request(request.url, {method:"POST",headers:request.headers,body:JSON.stringify({...body,actorId:body.actorId || body.idAthlete || ""})}), {params:Promise.resolve({kind:"athlete"})})
}
