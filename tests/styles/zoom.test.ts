// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('page zoom on phones', () => {
  it('locks the viewport scale', () => {
    const viewport = /<meta\s+name="viewport"\s+content="([^"]+)"/.exec(read('index.html'))?.[1]
    expect(viewport).toContain('maximum-scale=1.0')
    expect(viewport).toContain('user-scalable=no')
  })

  // Safari ignores user-scalable=no, so the CSS rule is what stops double-tap and pinch zoom there.
  it('allows only panning on every element', () => {
    expect(read('src/styles/global.css')).toMatch(/\*\s*\{\s*touch-action:\s*pan-x pan-y;\s*\}/)
  })
})
