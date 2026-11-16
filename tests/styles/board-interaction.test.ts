// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('board stability on touch screens', () => {
  // jsdom cannot emulate sticky Safari hover or measure portrait layout.
  it('limits both hover and pressed colours to a fine pointer with hover support', () => {
    const source = read('src/components/game/ChessBoard.vue')
    const mouseRules = source.match(
      /@media \(hover: hover\) and \(pointer: fine\)\s*\{\s*\.board-house:hover\s*\{[^}]*\}\s*\.board-house:active\s*\{[^}]*\}\s*\}/,
    )?.[0]
    expect(mouseRules).toContain('background-color: lightblue;')
    expect(mouseRules).toContain('background-color: blueviolet;')
    const remaining = source.replace(mouseRules ?? '', '')
    expect(remaining).not.toMatch(/\.board-house:(hover|active)/)
  })

  it('reserves badge space rather than removing it from the portrait layout', () => {
    const source = read('src/views/GameView.vue')
    const hiddenRule = source.match(/\.turn-status-hidden\s*\{([^}]*)\}/)?.[1]
    expect(hiddenRule).toContain('visibility: hidden;')
    expect(hiddenRule).not.toMatch(/display\s*:\s*none/)
  })
})
