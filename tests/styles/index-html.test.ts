// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const html = readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8')

describe('web app tags', () => {
  // Chrome warns that the Apple-only tag is deprecated, so the standard name must be present.
  it('declares the standard web app capability', () => {
    expect(html).toMatch(/<meta\s+name="mobile-web-app-capable"\s+content="yes"\s*\/>/)
  })
})
