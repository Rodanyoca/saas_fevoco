import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { createSheetReadBatcher } from "./sheet-read-batcher.ts"
test("une lecture par classeur et fusion des plages qui se recouvrent", async () => {
  const calls: { id: string; ranges: string[] }[] = []
  const read = createSheetReadBatcher<string>(async (id, ranges) => { calls.push({ id, ranges }); return Object.fromEntries(ranges.map(range => [range.split("!")[0], [id]])) }, () => false)
  const results = await Promise.all([read("REF", ["SEXES!A:C"]), read("REF", ["SEXES!A:H", "NIVEAUX_COACH!A:C"]), read("REF", ["SEXES!A:ZZ"]), read("ACT", ["COACHS!A:ZZ"])])
  assert.equal(calls.length, 2)
  assert.deepEqual(calls.find(call => call.id === "REF")?.ranges, ["NIVEAUX_COACH!A:C", "SEXES!A:ZZ"])
  assert.deepEqual(results[0], { SEXES: ["REF"] })
})
test("un onglet absent est isolé et les lectures suivantes fonctionnent", async () => {
  const read = createSheetReadBatcher<string>(async (_id, ranges) => { if (ranges.some(range => range.startsWith("ABSENT!"))) throw new Error("invalid range"); return { SEXES: ["M"] } }, error => error instanceof Error && error.message === "invalid range")
  const results = await Promise.allSettled([read("REF", ["ABSENT!A:C"]), read("REF", ["SEXES!A:C"])])
  assert.equal(results[0].status, "rejected")
  assert.deepEqual(results[1], { status: "fulfilled", value: { SEXES: ["M"] } })
  assert.deepEqual(await read("REF", ["SEXES!A:C"]), { SEXES: ["M"] })
})
test("une erreur réseau n'entraîne pas de multiplication des lectures", async () => {
  let calls = 0
  const read = createSheetReadBatcher<string>(async () => { calls++; throw new Error("ENOTFOUND") }, () => false)
  const results = await Promise.allSettled([read("REF", ["SEXES!A:C"]), read("REF", ["NIVEAUX_COACH!A:C"])])
  assert.equal(calls, 1)
  assert.ok(results.every(result => result.status === "rejected"))
})
