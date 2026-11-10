import type { Messages } from './types'

export const ptBR: Messages = {
  common: {
    loading: 'Carregando...',
    newGame: 'Nova partida?',
    clickOption: 'Clique na opção desejada',
    languageSelect: 'Idioma',
  },
  footer: {
    developedBy: 'Desenvolvido por',
    usingApi: 'usando a API',
  },
  install: {
    button: 'Instalar aplicativo',
    iosHint: 'Para instalar, toque em Compartilhar e depois em Adicionar à Tela de Início.',
  },
  home: {
    title: 'Olá',
    lead: 'Clique na opção desejada para os tipos de jogador e o tempo de turno.',
    or: 'OU',
    enterRoom: 'Entrar em uma sala',
    roomPrompt: 'Em qual sala você quer entrar?',
    shiftTimes: {
      five: '5 minutos',
      ten: '10 minutos',
      fifteen: '15 minutos',
    },
  },
  selectSide: {
    title: (gameId) => `Escolha um lado disponível para jogar a partida ${gameId}`,
    join: 'Entrar na partida',
    noSides: 'Esta partida não tem lados disponíveis',
  },
  promotePawn: {
    title: 'Escolha uma peça para promover seu peão',
    select: 'Selecionar peça',
  },
  answer: {
    received: {
      empate: 'Você recebeu uma proposta de empate',
      reset: 'Você recebeu uma proposta de reinício',
    },
    waiting: {
      empate: 'Aguardando a resposta à proposta de empate...',
      reset: 'Aguardando a resposta à proposta de reinício...',
    },
    lead: 'Clique na resposta desejada',
    accept: 'Aceitar',
    decline: 'Recusar',
    respond: 'Responder',
  },
  endGame: {
    proposeReset: 'Propor reinício',
    review: {
      title: 'Revisão da partida',
      moveList: 'Jogadas da partida',
      first: 'Posição inicial',
      previous: 'Jogada anterior',
      next: 'Próxima jogada',
      last: 'Posição final',
      position: (step, total) => `Jogada ${step} de ${total}`,
      startPosition: 'Posição inicial',
      noMoves: 'Nenhuma jogada foi feita nesta partida.',
      unavailable:
        'Não foi possível reproduzir as jogadas desta partida, então o tabuleiro mostra apenas a posição final.',
    },
  },
  game: {
    resign: 'Desistir',
    offerDraw: 'Oferecer empate',
    opponentJoined: 'O adversário entrou na partida!',
    connectionError: 'Erro de conexão com o servidor.',
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
      'Desistência: Um jogador deixou a partida': 'Desistência: um jogador deixou a partida',
      'Tempo esgotado: o tempo de um jogador acabou':
        'Tempo esgotado: o tempo de um jogador acabou',
    },
    moves: {
      'Roque Menor': 'Roque curto',
      'Roque Maior': 'Roque longo',
      'Primeiro Movimento Peão': 'Avanço duplo do peão',
      'Promoção do Peão': 'Promoção do peão',
      'En Passant': 'En passant',
      L: 'Movimento do cavalo',
    },
  },
  errors: {
    unexpected: 'Erro inesperado. Tente novamente.',
    noConnection: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
    notConfigured:
      'O endereço da API não está configurado. Defina VITE_API_BASE_URL e faça o deploy novamente.',
    notJson: 'A API não respondeu em JSON. Verifique se VITE_API_BASE_URL aponta para a API.',
  },
}
