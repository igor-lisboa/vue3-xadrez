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
    lead: 'Clicca sull’opzione desiderata per i tipi di giocatore e il tempo di gioco.',
    or: 'OPPURE',
    enterRoom: 'Entra in una stanza',
    roomPrompt: 'In quale stanza vuoi entrare?',
    shiftTimes: {
      five: '5 minuti',
      ten: '10 minuti',
      fifteen: '15 minuti',
      hour: '1 ora',
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
  },
  game: {
    resign: 'Abbandona',
    offerDraw: 'Proponi patta',
    opponentJoined: 'L’avversario si è unito alla partita!',
    connectionError: 'Errore di connessione con il server.',
  },
  labels: {
    sides: { 0: 'Bianco', 1: 'Nero' },
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
      'Tempo esgotado: o tempo de um jogador acabou':
        'Tempo scaduto: il tempo di un giocatore è finito',
    },
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
