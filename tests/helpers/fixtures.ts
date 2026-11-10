import type { GameType, PieceType, Square } from '@/api/types/catalogue'
import type { SimplifiedCell, SquareName } from '@/api/types/enums'
import type { GameSummary } from '@/api/types/game-summary'

export const pieceTypes: PieceType[] = [
  { id: 0, nome: 'Rei', classe: 'Rei' },
  { id: 1, nome: 'Rainha', classe: 'Rainha' },
  { id: 2, nome: 'Torre', classe: 'Torre' },
  { id: 3, nome: 'Bispo', classe: 'Bispo' },
  { id: 4, nome: 'Cavalo', classe: 'Cavalo' },
  { id: 5, nome: 'Peão', classe: 'Peao' },
]

/** 64 squares, A8 first, as the API sends them. */
export const squares: Square[] = Array.from({ length: 64 }, (_, index) => {
  const file = 'ABCDEFGH'[index % 8]
  const rank = 8 - Math.floor(index / 8)
  return {
    casa: `${file}${rank}` as SquareName,
    linha: Math.floor(index / 8),
    coluna: index % 8,
  }
})

export const gameTypes: GameType[] = [
  {
    id: 0,
    integranteLadoTipo: [
      { id: 0, nome: 'Humano' },
      { id: 0, nome: 'Humano' },
    ],
  },
  {
    id: 2,
    integranteLadoTipo: [
      { id: 1, nome: 'I.A.' },
      { id: 1, nome: 'I.A.' },
    ],
  },
]

export function emptyRows(): (SimplifiedCell | null)[][] {
  return Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, (): SimplifiedCell | null => null),
  )
}

export function makeSummary(overrides: Partial<GameSummary> = {}): GameSummary {
  return {
    id: 7,
    ladoIdAtual: 0,
    ladoBrancoTempoMilisegundosRestante: -1,
    ladoPretoTempoMilisegundosRestante: -1,
    tempoDeTurnoEmMilisegundos: -1,
    chequeLadoAtual: false,
    acoesSolicitadas: [],
    empatePropostoPeloLadoId: null,
    resetPropostoPeloLadoId: null,
    ladosIdDeslogados: [],
    enPassantCasaCaptura: null,
    finalizado: null,
    ladoIdVencedor: null,
    empateReivindicavel: false,
    tipoJogo: 'Humano X Humano',
    tabuleiro: emptyRows(),
    ...overrides,
  }
}
