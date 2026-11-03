import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/api/http'
import {
  listGameTypes,
  listPieceTypes,
  listPromotionPieces,
  listSquares,
} from '@/api/services/catalogue'
import { createGame, getGameSummary, listSidesWithoutPlayer } from '@/api/services/games'
import { joinGame, leaveGame } from '@/api/services/players'
import { listPossibleMoves, makeMove, promotePawn } from '@/api/services/moves'
import { answerProposal, proposeToOpponent } from '@/api/services/proposals'
import { triggerAi } from '@/api/services/ai'

vi.mock('@/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const envelope = (data: unknown, message = 'ok') => ({ data: { message, data, success: true } })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('catalogue services', () => {
  it('read the lookup routes and unwrap the data', async () => {
    vi.mocked(http.get).mockResolvedValue(envelope([{ id: 1 }]))
    await expect(listSquares()).resolves.toEqual([{ id: 1 }])
    await listGameTypes()
    await listPieceTypes()
    await listPromotionPieces()
    expect(vi.mocked(http.get).mock.calls.map(([url]) => url)).toEqual([
      '/tabela-equivalencia',
      '/tipos-de-jogo',
      '/tipos-de-peca',
      '/tipos-de-peca/promocao-peao',
    ])
  })
})

describe('game services', () => {
  it('creates a game with the body and returns its id', async () => {
    vi.mocked(http.post).mockResolvedValue(envelope({ id: 4 }))
    const body = { tipoJogo: 0 as const, tempoDeTurnoEmMilisegundos: -1 }
    await expect(createGame(body)).resolves.toEqual({ id: 4 })
    expect(http.post).toHaveBeenCalledWith('/jogos', body)
  })

  it('asks for the summary with the super simplified board', async () => {
    vi.mocked(http.get).mockResolvedValue(envelope({ id: 4 }))
    await getGameSummary(4)
    expect(http.get).toHaveBeenCalledWith('/jogos/4/simples', {
      params: { tabuleiroSuperSimplificado: true },
    })
  })

  it('lists the sides without a player', async () => {
    vi.mocked(http.get).mockResolvedValue(envelope([{ id: 1, lado: 'Preto' }]))
    await expect(listSidesWithoutPlayer(4)).resolves.toEqual([{ id: 1, lado: 'Preto' }])
    expect(http.get).toHaveBeenCalledWith('/jogos/4/lado-sem-jogador')
  })
})

describe('player services', () => {
  it('joins a side and returns the message', async () => {
    vi.mocked(http.post).mockResolvedValue(envelope(null, 'Joined'))
    await expect(joinGame(4, { ladoId: 0, tipoId: 0 })).resolves.toBe('Joined')
    expect(http.post).toHaveBeenCalledWith('/jogos/4/jogadores', { ladoId: 0, tipoId: 0 })
  })

  it('leaves a side and returns the message', async () => {
    vi.mocked(http.delete).mockResolvedValue(envelope(null, 'Resigned'))
    await expect(leaveGame(4, 1)).resolves.toBe('Resigned')
    expect(http.delete).toHaveBeenCalledWith('/jogos/4/jogadores/1')
  })
})

describe('move services', () => {
  it('lists the possible moves with the side header', async () => {
    vi.mocked(http.get).mockResolvedValue(envelope([]))
    await listPossibleMoves(4, 1, 'E2')
    expect(http.get).toHaveBeenCalledWith('/jogos/4/pecas/E2/possiveis-jogadas', {
      headers: { lado: 1 },
    })
  })

  it('plays a move from one square to another', async () => {
    vi.mocked(http.post).mockResolvedValue(envelope({}))
    await makeMove(4, 0, 'E2', 'E4')
    expect(http.post).toHaveBeenCalledWith(
      '/jogos/4/pecas/E2/move/E4',
      {},
      { headers: { lado: 0 } },
    )
  })

  it('promotes a pawn and returns the message', async () => {
    vi.mocked(http.post).mockResolvedValue(envelope(null, 'Promoted'))
    await expect(promotePawn(4, 0, 2)).resolves.toBe('Promoted')
    expect(http.post).toHaveBeenCalledWith('/jogos/4/promove-peao/2', {}, { headers: { lado: 0 } })
  })
})

describe('proposal services', () => {
  it('offers a draw or a reset with the side header', async () => {
    vi.mocked(http.put).mockResolvedValue(envelope(null, 'Offered'))
    await expect(proposeToOpponent(4, 0, 'empate')).resolves.toBe('Offered')
    expect(http.put).toHaveBeenCalledWith('/jogos/4/empate/propoe', {}, { headers: { lado: 0 } })
  })

  it('answers an offer with the boolean choice', async () => {
    vi.mocked(http.post).mockResolvedValue(envelope(null, 'Answered'))
    await expect(answerProposal(4, 1, 'reset', false)).resolves.toBe('Answered')
    expect(http.post).toHaveBeenCalledWith(
      '/jogos/4/reset/responde',
      { resposta: false },
      { headers: { lado: 1 } },
    )
  })
})

describe('ai service', () => {
  it('asks the server to run the AI', async () => {
    vi.mocked(http.get).mockResolvedValue(envelope(null))
    await triggerAi()
    expect(http.get).toHaveBeenCalledWith('/ia')
  })
})
