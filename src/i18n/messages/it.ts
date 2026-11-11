import type { Messages } from './types'

export const it: Messages = {
  common: {
    loading: 'Caricamento...',
    newGame: 'Nuova partita?',
    clickOption: 'Clicca sull’opzione desiderata',
    languageSelect: 'Lingua',
  },
  footer: {
    developedBy: 'Sviluppato da',
    usingApi: 'utilizzando l’API',
  },
  install: {
    button: 'Installa l’app',
    iosHint: 'Per installare, tocca Condividi e poi Aggiungi a Home.',
  },
  home: {
    title: 'Ciao',
    lead: 'Clicca sull’opzione desiderata per i tipi di giocatore e il tempo di gioco di ciascun lato.',
    or: 'OPPURE',
    enterRoom: 'Entra in una stanza',
    roomPrompt: 'In quale stanza vuoi entrare?',
    reviewGame: 'Rivedi una partita',
    reviewPrompt: 'Qual è il numero della stanza della partita da rivedere?',
    shiftTimes: {
      five: '5 minuti per lato',
      ten: '10 minuti per lato',
      fifteen: '15 minuti per lato',
    },
  },
  selectSide: {
    title: (gameId) => `Scegli un lato disponibile per giocare la partita ${gameId}`,
    join: 'Unisciti alla partita',
    noSides: 'Questa partita non ha lati disponibili',
  },
  promotePawn: {
    title: 'Scegli un pezzo per promuovere il pedone',
    select: 'Seleziona il pezzo',
  },
  answer: {
    received: {
      empate: 'Hai ricevuto una proposta di patta',
      reset: 'Hai ricevuto una proposta di reset',
    },
    waiting: {
      empate: 'In attesa della risposta alla proposta di patta...',
      reset: 'In attesa della risposta alla proposta di reset...',
    },
    lead: 'Clicca la risposta desiderata',
    accept: 'Accetta',
    decline: 'Rifiuta',
    respond: 'Rispondi',
  },
  endGame: {
    proposeReset: 'Proponi reset',
    reviewGame: 'Rivedi la partita',
  },
  material: {
    title: 'Pezzi rimasti',
    noMaterial: 'Nessuno dei due ha abbastanza pezzi per dare scacco matto.',
    timeOut: { 0: 'Il Bianco ha esaurito il tempo.', 1: 'Il Nero ha esaurito il tempo.' },
  },
  review: {
    title: 'Revisione della partita',
    room: (gameId) => `Stanza ${gameId}`,
    inProgress: 'Partita in corso',
    moveList: 'Mosse della partita',
    first: 'Posizione iniziale',
    previous: 'Mossa precedente',
    next: 'Mossa successiva',
    last: 'Posizione finale',
    position: (step, total) => `Mossa ${step} di ${total}`,
    startPosition: 'Posizione iniziale',
    noMoves: 'In questa partita non è stata giocata nessuna mossa.',
    unavailable:
      'Le mosse di questa partita non si possono riprodurre, quindi la scacchiera mostra solo la posizione finale.',
    timeUsed: (side, time) => `Tempo usato (${side}): ${time}`,
  },
  game: {
    resign: 'Abbandona',
    offerDraw: 'Proponi patta',
    claimDraw: 'Reclama la patta',
    claimDrawHint:
      'Questa posizione permette di reclamare la patta (triplice ripetizione o regola delle 50 mosse).',
    claimWithMove: 'Reclama la patta con la mia prossima mossa',
    claimWithMoveWarning:
      'Per una ripetizione o la regola delle 50 mosse che la tua prossima mossa creerebbe. Se la richiesta non è valida, la mossa viene giocata comunque e l’avversario riceve una proposta di patta.',
    claimNotValid:
      'La richiesta di patta non era valida: la tua mossa è stata giocata e l’avversario ha ricevuto una proposta di patta.',
    moveDeclinesDraw: 'Se invece giochi una mossa, la proposta viene rifiutata.',
    opponentJoined: 'L’avversario si è unito alla partita!',
    connectionError: 'Errore di connessione con il server.',
  },
  labels: {
    sides: { 0: 'Bianco', 1: 'Nero' },
    winners: { 0: 'Vincitore: il Bianco', 1: 'Vincitore: il Nero' },
    playerTypes: { 0: 'Umano', 1: 'IA' },
    pieces: {
      Rei: 'Re',
      Rainha: 'Donna',
      Torre: 'Torre',
      Bispo: 'Alfiere',
      Cavalo: 'Cavallo',
      Peão: 'Pedone',
    },
    endings: {
      'Vitória: Branco': 'Vittoria del Bianco',
      'Vitória: Preto': 'Vittoria del Nero',
      'Empate: Regra 50 movimentos': 'Patta: regola delle 50 mosse',
      'Empate: Insuficiência material': 'Patta: materiale insufficiente',
      'Empate: Rei afogado': 'Stallo',
      'Empate: Comum acordo': 'Patta per accordo',
      'Empate: Regra das 3 posições': 'Patta: triplice ripetizione',
      'Desistência: Um jogador deixou a partida': 'Abbandono: un giocatore ha lasciato la partita',
      'Empate: Tempo esgotado sem material':
        'Patta: tempo scaduto e l’avversario non può dare scacco matto',
      'Empate: Regra das 5 posições': 'Patta: quintuplice ripetizione',
      'Empate: Regra 75 movimentos': 'Patta: regola delle 75 mosse',
      'Empate: Posição morta': 'Patta: posizione morta',
    },
    finishReasons: {
      xequeMate: ({ winner }) => `Vittoria del ${winner} per scacco matto`,
      tempoEsgotado: ({ winner, loser }) =>
        `Vittoria del ${winner}: il tempo del ${loser} è scaduto`,
      desistencia: ({ winner, loser }) => `Vittoria del ${winner}: il ${loser} si è arreso`,
      reiAfogado: ({ winner }) => `Vittoria del ${winner}: stallo`,
      comumAcordo: ({ winner }) => `Vittoria del ${winner}: accordo reciproco`,
      regra50Movimentos: ({ winner }) => `Vittoria del ${winner}: regola delle 50 mosse`,
      regra75Movimentos: ({ winner }) => `Vittoria del ${winner}: regola delle 75 mosse`,
      repeticao3Posicoes: ({ winner }) => `Vittoria del ${winner}: triplice ripetizione`,
      repeticao5Posicoes: ({ winner }) => `Vittoria del ${winner}: quintupla ripetizione`,
      insuficienciaMaterial: ({ winner }) => `Vittoria del ${winner}: materiale insufficiente`,
      posicaoMorta: ({ winner }) => `Vittoria del ${winner}: posizione morta`,
    },
    resignationDraw: ({ resigner, other }) =>
      `Patta: il ${resigner} si è arreso, ma il ${other} non aveva materiale per dare scacco matto`,
    moves: {
      'Roque Menor': 'Arrocco corto',
      'Roque Maior': 'Arrocco lungo',
      'Primeiro Movimento Peão': 'Doppio passo del pedone',
      'Promoção do Peão': 'Promozione del pedone',
      'En Passant': 'Presa en passant',
      L: 'Mossa del cavallo',
    },
  },
  errors: {
    unexpected: 'Errore imprevisto. Riprova.',
    noConnection: 'Impossibile raggiungere il server. Riprova più tardi.',
    notConfigured:
      'L’indirizzo dell’API non è configurato. Imposta VITE_API_BASE_URL e pubblica di nuovo.',
    notJson: 'L’API non ha risposto con JSON. Verifica che VITE_API_BASE_URL punti all’API.',
  },
}
