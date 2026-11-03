import type { Messages } from './types'

// European Portuguese spelling and vocabulary differ from Brazilian Portuguese, so it has its own file.
export const pt: Messages = {
  common: {
    loading: 'A carregar...',
    newGame: 'Novo jogo?',
    clickOption: 'Clique na opção pretendida',
    languageSelect: 'Idioma',
  },
  footer: {
    developedBy: 'Desenvolvido por',
    usingApi: 'a usar a API',
  },
  home: {
    title: 'Olá',
    lead: 'Clique na opção pretendida para os tipos de jogador e o tempo por jogada.',
    or: 'OU',
    enterRoom: 'Entrar numa sala',
    roomPrompt: 'Em que sala pretende entrar?',
    shiftTimes: {
      none: 'Sem limite de tempo',
      five: '5 minutos',
      ten: '10 minutos',
      fifteen: '15 minutos',
      hour: '1 hora',
    },
  },
  selectSide: {
    title: (gameId) => `Escolha um lado disponível para jogar o jogo ${gameId}`,
    join: 'Entrar no jogo',
    noSides: 'Este jogo não tem lados disponíveis',
  },
  promotePawn: {
    title: 'Escolha uma peça para promover o seu peão',
    select: 'Selecionar peça',
  },
  answer: {
    received: {
      empate: 'Recebeu uma proposta de empate',
      reset: 'Recebeu uma proposta de reinício',
    },
    waiting: {
      empate: 'A aguardar a resposta à proposta de empate...',
      reset: 'A aguardar a resposta à proposta de reinício...',
    },
    lead: 'Clique na resposta pretendida',
    accept: 'Aceitar',
    decline: 'Recusar',
    respond: 'Responder',
  },
  endGame: {
    proposeReset: 'Propor reinício',
  },
  game: {
    resign: 'Desistir',
    offerDraw: 'Oferecer empate',
    opponentJoined: 'O adversário entrou no jogo!',
    connectionError: 'Erro de ligação com o servidor.',
  },
  labels: {
    sides: { 0: 'Brancas', 1: 'Pretas' },
    playerTypes: { 0: 'Humano', 1: 'IA' },
    pieces: {
      Rei: 'Rei',
      Rainha: 'Rainha',
      Torre: 'Torre',
      Bispo: 'Bispo',
      Cavalo: 'Cavalo',
      Peão: 'Peão',
    },
    endings: {
      'Vitória: Branco': 'Vitória das brancas',
      'Vitória: Preto': 'Vitória das pretas',
      'Empate: Regra 50 movimentos': 'Empate: regra dos 50 movimentos',
      'Empate: Insuficiência material': 'Empate: material insuficiente',
      'Empate: Rei afogado': 'Empate: afogamento',
      'Empate: Comum acordo': 'Empate por acordo mútuo',
      'Empate: Regra das 3 posições': 'Empate: repetição de posições',
      'Desistência: Um jogador deixou a partida': 'Desistência: um jogador abandonou o jogo',
      'Tempo esgotado: o tempo de um jogador acabou':
        'Tempo esgotado: o tempo de um jogador acabou',
    },
    moves: {
      'Roque Menor': 'Roque pequeno',
      'Roque Maior': 'Roque grande',
      'Primeiro Movimento Peão': 'Avanço duplo do peão',
      'Promoção do Peão': 'Promoção do peão',
      'En Passant': 'En passant',
      L: 'Movimento do cavalo',
    },
  },
  errors: {
    unexpected: 'Erro inesperado. Tente novamente.',
    noConnection: 'Não foi possível contactar o servidor. Tente novamente mais tarde.',
    notConfigured:
      'O endereço da API não está configurado. Defina VITE_API_BASE_URL e volte a fazer o deploy.',
    notJson: 'A API não respondeu em JSON. Verifique se VITE_API_BASE_URL aponta para a API.',
  },
}
