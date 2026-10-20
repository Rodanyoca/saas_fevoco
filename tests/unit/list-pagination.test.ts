import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's TypeScript runner requires an explicit extension.
import { paginateRows } from "../../lib/list-pagination.ts"

test("chaque ligne apparaît une fois entre les pages, y compris la dernière incomplète", () => {
  const rows = Array.from({ length: 23 }, (_, index) => index)
  const pages = [1, 2, 3].map(page => paginateRows(rows, page, 10))
  assert.deepEqual(pages.flatMap(page => page.items), rows)
  assert.deepEqual(pages.map(({ start, end }) => [start, end]), [[1, 10], [11, 20], [21, 23]])
})

test("un filtre ou une suppression borne une page devenue inexistante", () => {
  const page = paginateRows(["seul résultat"], 8, 10)
  assert.equal(page.page, 1)
  assert.deepEqual(page.items, ["seul résultat"])
  assert.equal(page.pageCount, 1)
})

test("une liste vide conserve une page stable et une plage 0–0", () => {
  const page = paginateRows([], 4, 25)
  assert.deepEqual([page.page, page.pageCount, page.total, page.start, page.end], [1, 1, 0, 0, 0])
  assert.deepEqual(page.items, [])
})

test("la taille change la découpe sans muter la source", () => {
  const rows = Object.freeze(Array.from({ length: 51 }, (_, index) => index))
  const page = paginateRows(rows, 2, 25)
  assert.deepEqual([page.start, page.end, page.pageCount], [26, 50, 3])
  assert.equal(rows.length, 51)
})
