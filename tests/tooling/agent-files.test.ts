// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildOutputs,
  diffOutputs,
  loadCanonical,
  normalizeNewlines,
  npmScriptsMentioned,
  parseFrontmatter,
  repoPathsMentioned,
  validateCanonical,
} from '../../scripts/lib/agents.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))

const canonical = loadCanonical(root)
const outputs = buildOutputs(canonical)
const packageScripts = Object.keys(
  (JSON.parse(read('package.json')) as { scripts: object }).scripts,
)

/** Files that tell the reader which commands and paths to use. */
const instructionFiles = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md']
const documents = [
  ...canonical.skills.map((item) => ({
    name: item.path,
    text: normalizeNewlines(read(item.path)),
  })),
  ...canonical.agents.map((item) => ({
    name: item.path,
    text: normalizeNewlines(read(item.path)),
  })),
  ...instructionFiles.map((file) => ({ name: file, text: normalizeNewlines(read(file)) })),
]

function read(relative: string): string {
  return readFileSync(join(root, relative), 'utf8')
}

describe('canonical skills and agents', () => {
  it('exist', () => {
    expect(canonical.skills.length).toBeGreaterThan(0)
    expect(canonical.agents.length).toBeGreaterThan(0)
  })

  it('are valid: name and description, kebab-case, name equals folder or file name', () => {
    expect(validateCanonical(canonical)).toEqual([])
  })

  it('are all listed in AGENTS.md, so Codex users can find them', () => {
    const agentsFile = read('AGENTS.md')
    const names = [...canonical.skills, ...canonical.agents].map((entry) => entry.data.name ?? '')
    expect(names.filter((name) => !agentsFile.includes(`\`${name}\``))).toEqual([])
  })
})

describe('generated copies on disk', () => {
  it('are in sync with the canonical files (run "npm run sync:agents")', () => {
    expect(diffOutputs(root, outputs)).toEqual({ missing: [], changed: [], stale: [] })
  })

  it('give every tool a copy of every skill and agent', () => {
    for (const skill of canonical.skills) {
      expect(outputs.has(`.claude/skills/${skill.data.name}/SKILL.md`)).toBe(true)
    }
    for (const agent of canonical.agents) {
      expect(outputs.has(`.claude/agents/${agent.data.name}.md`)).toBe(true)
      expect(outputs.has(`.github/agents/${agent.data.name}.agent.md`)).toBe(true)
      expect(outputs.has(`.codex/agents/${agent.data.name}.toml`)).toBe(true)
    }
  })

  it('keep a frontmatter that parses back to the canonical name and description', () => {
    for (const [file, content] of outputs) {
      if (file.endsWith('.toml')) continue
      const source = [...canonical.skills, ...canonical.agents].find(
        (entry) => file.includes(`/${entry.data.name}.`) || file.includes(`/${entry.data.name}/`),
      )
      const { data } = parseFrontmatter(content)
      expect(data.name, file).toBe(source?.data.name)
      expect(data.description, file).toBe(source?.data.description)
    }
  })
})

describe('commands and paths written in skills, agents and instruction files', () => {
  it('only use npm scripts that exist in package.json', () => {
    const unknown = documents.flatMap(({ name, text }) =>
      npmScriptsMentioned(text)
        .filter((script) => !packageScripts.includes(script))
        .map((script) => `${name}: npm run ${script}`),
    )
    expect(unknown).toEqual([])
  })

  it('only point to repository paths that exist', () => {
    const missing = documents.flatMap(({ name, text }) =>
      repoPathsMentioned(text)
        .filter((path) => !existsSync(join(root, path)))
        .map((path) => `${name}: ${path}`),
    )
    expect(missing).toEqual([])
  })
})

describe('Copilot path-specific instructions', () => {
  it('each declare an applyTo glob', () => {
    const dir = join(root, '.github/instructions')
    const files = readdirSync(dir).filter((file) => file.endsWith('.instructions.md'))
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      expect(
        parseFrontmatter(readFileSync(join(dir, file), 'utf8')).data.applyTo,
        file,
      ).toBeTruthy()
    }
  })
})
