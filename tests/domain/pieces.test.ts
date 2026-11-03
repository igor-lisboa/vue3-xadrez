import { describe, expect, it } from 'vitest'
import sprite from '@/assets/pieces/standard.svg?raw'
import type { PieceName, SideId } from '@/api/types/enums'
import { pieceSpriteId } from '@/domain/pieces'

const PIECES: PieceName[] = ['Rei', 'Rainha', 'Torre', 'Bispo', 'Cavalo', 'Peão']
const SIDES: SideId[] = [0, 1]

describe('pieceSpriteId', () => {
  it('names the drawing by side and piece letter', () => {
    expect(pieceSpriteId('Rei', 0)).toBe('wk')
    expect(pieceSpriteId('Rainha', 0)).toBe('wq')
    expect(pieceSpriteId('Torre', 1)).toBe('br')
    expect(pieceSpriteId('Bispo', 1)).toBe('bb')
    expect(pieceSpriteId('Cavalo', 1)).toBe('bn')
    expect(pieceSpriteId('Peão', 1)).toBe('bp')
  })

  it('has a drawing in the sprite for every piece of both sides', () => {
    for (const side of SIDES) {
      for (const piece of PIECES) {
        expect(sprite).toContain(`id="${pieceSpriteId(piece, side)}"`)
      }
    }
  })
})
