// Generates the per-tool copies of the skills and agents from the canonical files in .agents/.
//
//   node scripts/sync-agents.mjs           write the generated files (and remove stale ones)
//   node scripts/sync-agents.mjs --check   write nothing; exit 1 when a generated file differs
//
// The formats, locations and sources are documented at the top of scripts/lib/agents.mjs.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildOutputs, diffOutputs, loadCanonical, validateCanonical } from './lib/agents.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

const canonical = loadCanonical(root)
const problems = validateCanonical(canonical)
if (problems.length > 0) {
  console.error(problems.map((problem) => `error: ${problem}`).join('\n'))
  process.exit(1)
}

const outputs = buildOutputs(canonical)
const { missing, changed, stale } = diffOutputs(root, outputs)

if (checkOnly) {
  const report = [
    ...missing.map((file) => `missing: ${file}`),
    ...changed.map((file) => `out of date: ${file}`),
    ...stale.map((file) => `stale: ${file}`),
  ]
  if (report.length > 0) {
    console.error(`${report.join('\n')}\nRun "npm run sync:agents" and commit the result.`)
    process.exit(1)
  }
  console.log(`Generated agent files are up to date (${outputs.size} files).`)
} else {
  for (const file of [...missing, ...changed]) {
    const target = join(root, file)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, outputs.get(file) ?? '', 'utf8')
    console.log(`wrote ${file}`)
  }
  for (const file of stale) {
    rmSync(join(root, file))
    console.log(`removed ${file}`)
  }
  console.log(`Done: ${missing.length + changed.length} written, ${stale.length} removed.`)
}
