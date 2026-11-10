import type { Messages } from './types'

export const en: Messages = {
  common: {
    loading: 'Loading...',
    newGame: 'New game?',
    clickOption: 'Click the option you want',
    languageSelect: 'Language',
  },
  footer: {
    developedBy: 'Developed by',
    usingApi: 'using the API',
  },
  install: {
    button: 'Install app',
    iosHint: 'To install, tap Share and then Add to Home Screen.',
  },
  home: {
    title: 'Hello',
    lead: 'Click the option you want for the player types and the turn time.',
    or: 'OR',
    enterRoom: 'Enter a room',
    roomPrompt: 'Which room do you want to enter?',
    shiftTimes: {
      five: '5 minutes',
      ten: '10 minutes',
      fifteen: '15 minutes',
    },
  },
  selectSide: {
    title: (gameId) => `Choose an available side to play game ${gameId}`,
    join: 'Join game',
    noSides: 'This game has no available sides',
  },
  promotePawn: {
    title: 'Choose a piece to promote your pawn',
    select: 'Select piece',
  },
  answer: {
    received: {
      empate: 'You received a draw proposal',
      reset: 'You received a reset proposal',
    },
    waiting: {
      empate: 'Waiting for the answer to the draw proposal...',
      reset: 'Waiting for the answer to the reset proposal...',
    },
    lead: 'Click the answer you want',
    accept: 'Accept',
    decline: 'Decline',
    respond: 'Respond',
  },
  endGame: {
    proposeReset: 'Propose reset',
    review: {
      title: 'Game review',
      moveList: 'Moves of the game',
      first: 'Starting position',
      previous: 'Previous move',
      next: 'Next move',
      last: 'Final position',
      position: (step, total) => `Move ${step} of ${total}`,
      startPosition: 'Starting position',
      noMoves: 'No moves were played in this game.',
      unavailable:
        'The moves of this game cannot be replayed, so the board shows the final position only.',
    },
  },
  game: {
    resign: 'Resign',
    offerDraw: 'Offer draw',
    opponentJoined: 'The opponent joined the game!',
    connectionError: 'Connection error with the server.',
  },
  labels: {
    sides: { 0: 'White', 1: 'Black' },
    playerTypes: { 0: 'Human', 1: 'AI' },
    pieces: {
      Rei: 'King',
      Rainha: 'Queen',
      Torre: 'Rook',
      Bispo: 'Bishop',
      Cavalo: 'Knight',
      Peão: 'Pawn',
    },
    endings: {
      'Vitória: Branco': 'White wins',
      'Vitória: Preto': 'Black wins',
      'Empate: Regra 50 movimentos': 'Draw: 50-move rule',
      'Empate: Insuficiência material': 'Draw: insufficient material',
      'Empate: Rei afogado': 'Draw: stalemate',
      'Empate: Comum acordo': 'Draw: by agreement',
      'Empate: Regra das 3 posições': 'Draw: threefold repetition',
      'Desistência: Um jogador deixou a partida': 'Resignation: a player left the game',
      'Tempo esgotado: o tempo de um jogador acabou': 'Time out: a player ran out of time',
    },
    moves: {
      'Roque Menor': 'Short castling',
      'Roque Maior': 'Long castling',
      'Primeiro Movimento Peão': 'Pawn double step',
      'Promoção do Peão': 'Pawn promotion',
      'En Passant': 'En passant',
      L: 'Knight move',
    },
  },
  errors: {
    unexpected: 'Unexpected error. Please try again.',
    noConnection: 'Could not reach the server. Please try again later.',
    notConfigured: 'The API address is not configured. Set VITE_API_BASE_URL and deploy again.',
    notJson: 'The API did not answer with JSON. Check that VITE_API_BASE_URL points to the API.',
  },
}
