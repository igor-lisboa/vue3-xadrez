import type { Messages } from './types'

export const de: Messages = {
  common: {
    loading: 'Wird geladen...',
    newGame: 'Neues Spiel?',
    clickOption: 'Klicke auf die gewünschte Option',
    languageSelect: 'Sprache',
  },
  footer: {
    developedBy: 'Entwickelt von',
    usingApi: 'unter Verwendung der API',
  },
  install: {
    button: 'App installieren',
    iosHint: 'Zum Installieren tippen Sie auf Teilen und dann auf Zum Home-Bildschirm.',
  },
  home: {
    title: 'Hallo',
    lead: 'Klicke auf die gewünschte Option für die Spielertypen und die Bedenkzeit.',
    or: 'ODER',
    enterRoom: 'Raum betreten',
    roomPrompt: 'Welchen Raum möchtest du betreten?',
    reviewGame: 'Eine Partie ansehen',
    reviewPrompt: 'Welche Raumnummer hat die Partie, die du ansehen möchtest?',
    shiftTimes: {
      five: '5 Minuten',
      ten: '10 Minuten',
      fifteen: '15 Minuten',
    },
  },
  selectSide: {
    title: (gameId) => `Wähle eine freie Seite, um Spiel ${gameId} zu spielen`,
    join: 'Spiel beitreten',
    noSides: 'Dieses Spiel hat keine freien Seiten',
  },
  promotePawn: {
    title: 'Wähle eine Figur, zu der dein Bauer werden soll',
    select: 'Figur auswählen',
  },
  answer: {
    received: {
      empate: 'Du hast einen Remisvorschlag erhalten',
      reset: 'Du hast einen Vorschlag zum Zurücksetzen erhalten',
    },
    waiting: {
      empate: 'Warten auf die Antwort auf den Remisvorschlag...',
      reset: 'Warten auf die Antwort auf den Vorschlag zum Zurücksetzen...',
    },
    lead: 'Klicke auf die gewünschte Antwort',
    accept: 'Annehmen',
    decline: 'Ablehnen',
    respond: 'Antworten',
  },
  endGame: {
    proposeReset: 'Zurücksetzen vorschlagen',
    reviewGame: 'Partie ansehen',
  },
  material: {
    title: 'Verbliebene Figuren',
    noMaterial: 'Keine Seite hat genug Material, um mattzusetzen.',
    timeOut: { 0: 'Weiß hat keine Zeit mehr.', 1: 'Schwarz hat keine Zeit mehr.' },
  },
  review: {
    title: 'Partieanalyse',
    room: (gameId) => `Raum ${gameId}`,
    inProgress: 'Partie läuft noch',
    moveList: 'Züge der Partie',
    first: 'Ausgangsstellung',
    previous: 'Voriger Zug',
    next: 'Nächster Zug',
    last: 'Endstellung',
    position: (step, total) => `Zug ${step} von ${total}`,
    startPosition: 'Ausgangsstellung',
    noMoves: 'In dieser Partie wurde kein Zug gespielt.',
    unavailable:
      'Die Züge dieser Partie lassen sich nicht nachspielen, daher zeigt das Brett nur die Endstellung.',
  },
  game: {
    resign: 'Aufgeben',
    offerDraw: 'Remis anbieten',
    claimDraw: 'Remis beanspruchen',
    claimDrawHint:
      'In dieser Stellung kannst du Remis beanspruchen (dreifache Stellungswiederholung oder 50-Züge-Regel).',
    claimWithMove: 'Remis mit meinem nächsten Zug beanspruchen',
    claimWithMoveWarning:
      'Für eine Wiederholung oder die 50-Züge-Regel, die dein nächster Zug herbeiführen würde. Ist der Anspruch nicht gültig, wird der Zug trotzdem gespielt und dein Gegner erhält ein Remisangebot.',
    claimNotValid:
      'Der Remisanspruch war nicht gültig: Dein Zug wurde gespielt und dein Gegner hat ein Remisangebot erhalten.',
    moveDeclinesDraw: 'Wenn du stattdessen ziehst, lehnst du das Angebot ab.',
    opponentJoined: 'Der Gegner ist dem Spiel beigetreten!',
    connectionError: 'Verbindungsfehler mit dem Server.',
  },
  labels: {
    sides: { 0: 'Weiß', 1: 'Schwarz' },
    winners: { 0: 'Gewinner: Weiß', 1: 'Gewinner: Schwarz' },
    playerTypes: { 0: 'Mensch', 1: 'KI' },
    pieces: {
      Rei: 'König',
      Rainha: 'Dame',
      Torre: 'Turm',
      Bispo: 'Läufer',
      Cavalo: 'Springer',
      Peão: 'Bauer',
    },
    endings: {
      'Vitória: Branco': 'Sieg für Weiß',
      'Vitória: Preto': 'Sieg für Schwarz',
      'Empate: Regra 50 movimentos': 'Remis: 50-Züge-Regel',
      'Empate: Insuficiência material': 'Remis: ungenügendes Material',
      'Empate: Rei afogado': 'Patt',
      'Empate: Comum acordo': 'Remis durch Einigung',
      'Empate: Regra das 3 posições': 'Remis: dreifache Stellungswiederholung',
      'Desistência: Um jogador deixou a partida': 'Aufgabe: ein Spieler hat das Spiel verlassen',
      'Empate: Tempo esgotado sem material':
        'Remis: Zeit abgelaufen und der Gegner kann nicht mattsetzen',
      'Empate: Regra das 5 posições': 'Remis: fünffache Stellungswiederholung',
      'Empate: Regra 75 movimentos': 'Remis: 75-Züge-Regel',
      'Empate: Posição morta': 'Remis: tote Stellung',
    },
    moves: {
      'Roque Menor': 'Kurze Rochade',
      'Roque Maior': 'Lange Rochade',
      'Primeiro Movimento Peão': 'Doppelschritt des Bauern',
      'Promoção do Peão': 'Bauernumwandlung',
      'En Passant': 'En passant',
      L: 'Springerzug',
    },
  },
  errors: {
    unexpected: 'Unerwarteter Fehler. Bitte versuche es erneut.',
    noConnection: 'Der Server ist nicht erreichbar. Bitte versuche es später erneut.',
    notConfigured:
      'Die API-Adresse ist nicht konfiguriert. Setze VITE_API_BASE_URL und deploye erneut.',
    notJson:
      'Die API hat nicht mit JSON geantwortet. Prüfe, ob VITE_API_BASE_URL auf die API zeigt.',
  },
}
