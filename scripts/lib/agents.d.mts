// Types for agents.mjs, so TypeScript (tests) can import it without allowJs.

export interface CanonicalItem {
  /** Folder name of a skill, or file name without extension of an agent. */
  folder: string
  /** Path relative to the repository root. */
  path: string
  data: Record<string, string>
  body: string
}

export interface Canonical {
  skills: CanonicalItem[]
  agents: CanonicalItem[]
}

export interface OutputDiff {
  missing: string[]
  changed: string[]
  stale: string[]
}

export const SKILLS_SOURCE: string
export const AGENTS_SOURCE: string
export const GENERATED_MARKER: string
export const TOOL_NAMES: Record<string, { claude: string[]; copilot: string[] }>
export const KEBAB_CASE: RegExp

export function normalizeNewlines(text: string): string
export function parseFrontmatter(text: string): { data: Record<string, string>; body: string }
export function loadCanonical(root: string): Canonical
export function agentTools(agent: CanonicalItem): string[]
export function validateCanonical(canonical: Canonical): string[]
export function renderClaudeSkill(skill: CanonicalItem): string
export function renderClaudeAgent(agent: CanonicalItem): string
export function renderCopilotAgent(agent: CanonicalItem): string
export function renderCodexAgent(agent: CanonicalItem): string
export function buildOutputs(canonical: Canonical): Map<string, string>
export function findStale(root: string, outputs: Map<string, string>): string[]
export function diffOutputs(root: string, outputs: Map<string, string>): OutputDiff
export function npmScriptsMentioned(text: string): string[]
export function repoPathsMentioned(text: string): string[]
