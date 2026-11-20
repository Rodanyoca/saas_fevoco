/* global require, __dirname, console, process */
/* eslint-disable @typescript-eslint/no-require-imports -- Baseline and current real services with isolated Sheets. */
const fs = require("node:fs"), path = require("node:path"), cp = require("node:child_process")
const root = path.resolve(__dirname, ".."), baselineCommit = "23c8a76"
const baseline = path.join(root, ".next/cache/attachment-baseline-23c8a76")
for (const file of cp.execFileSync("git", ["ls-tree", "-r", "--name-only", baselineCommit, "lib", "tests/helpers"], {cwd:root,encoding:"utf8"}).trim().split("\n")) {
  const target = path.resolve(baseline, file)
  if (!target.startsWith(baseline + path.sep)) throw new Error("Invalid baseline path")
  if (fs.existsSync(target)) continue // Cache is scoped to the immutable baseline commit.
  fs.mkdirSync(path.dirname(target), {recursive:true})
  fs.writeFileSync(target, cp.execFileSync("git", ["show", `${baselineCommit}:${file}`], {cwd:root}))
}
const old = require(path.join(baseline, "tests/helpers/sports-harness.cjs")), current = require("../tests/helpers/sports-harness.cjs")
const metrics = h => ({ logicalReads:h.reads.length, valueBatches:h.reads.filter(r => r.kind === "values" || r.kind === "cached-values").length, writes:h.calls.length, businessBatches:h.calls.filter(r => r.business).length })
async function main() {
  const input = {id_type_transfert:"TRF001",id_club:"0101001",date_debut:"2026-01-01",date_fin:"",id_statut_affiliation:"SAF001",id_affiliation_precedente:"",idempotency_key:"99999999-1111-4111-8111-111111111111"}
  const before = old.harness({onboarding:true,management:true})
  before.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length = 1
  const affiliation = await before.mutateAthleteTransfer("ATH00001", input)
  const oldAffiliationOnly = metrics(before)
  await before.mutateSeasonalLicence({id_athlete:"ATH00001",id_affiliation_athlete:affiliation.id_affiliation_athlete,id_saison:"SAI006",date_delivrance:"2026-11-20",id_statut_licence:"STL001",idempotency_key:"88888888-1111-4111-8111-111111111111"})
  const after = current.harness({onboarding:true,management:true})
  after.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length = 1
  await after.loadModule("lib/athlete-attachment.ts").runAthleteAttachment(after.createStore(), after.operation(input.idempotency_key, input), "ATH00001", input, "2026-11-20")
  const result = {baselineCommit,oldAffiliationOnly,oldCompleteAffiliationAndLicence:metrics(before),newCoordinatedAttachment:metrics(after),productionWrites:0}
  const evidence = path.join(root, "docs/verification/athlete-attachment")
  fs.mkdirSync(evidence, {recursive:true}); fs.writeFileSync(path.join(evidence,"metrics.json"),JSON.stringify(result,null,2))
  console.log(JSON.stringify(result))
}
main().catch(error => {console.error(error);process.exitCode=1})
