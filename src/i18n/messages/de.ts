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
  home: {
    title: 'Hallo',
    lead: 'Klicke auf die gewünschte Option für die Spielertypen und die Bedenkzeit.',
    or: 'ODER',
    enterRoom: 'Raum betreten',
    roomPrompt: 'Welchen Raum möchtest du betreten?',
    shiftTimes: {
      five: '5 Minuten',
      ten: '10 Minuten',
      fifteen: '15 Minuten',
      hour: '1 Stunde',
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
  },
  game: {
    resign: 'Aufgeben',
    offerDraw: 'Remis anbieten',
    opponentJoined: 'Der Gegner ist dem Spiel beigetreten!',
    connectionError: 'Verbindungsfehler mit dem Server.',
  },
  labels: {
    sides: { 0: 'Weiß', 1: 'Schwarz' },
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
      'Tempo esgotado: o tempo de um jogador acabou':
        'Zeit abgelaufen: die Zeit eines Spielers ist um',
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
