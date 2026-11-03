import type { PieceName, SideId } from '@/api/types/enums'
import { WHITE } from './constants'

/** Letter of each piece in the SVG sprite (`src/assets/pieces/standard.svg`). */
const SPRITE_LETTER: Record<PieceName, string> = {
  Rei: 'k',
  Rainha: 'q',
  Torre: 'r',
  Bispo: 'b',
  Cavalo: 'n',
  Peão: 'p',
}

/**
 * Id of the piece's drawing in the sprite, for example `wk` (white king) or `bp` (black pawn).
 * The sprite is used instead of Unicode chess symbols: those are font glyphs that differ
 * between white and black and between devices.
 */
export function pieceSpriteId(name: PieceName, sideId: SideId): string {
  const side = sideId === WHITE ? 'w' : 'b'
  return `${side}${SPRITE_LETTER[name]}`
}
