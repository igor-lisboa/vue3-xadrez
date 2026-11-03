import type { Messages } from './types'

export const fr: Messages = {
  common: {
    loading: 'Chargement...',
    newGame: 'Nouvelle partie ?',
    clickOption: 'Cliquez sur l’option souhaitée',
    languageSelect: 'Langue',
  },
  footer: {
    developedBy: 'Développé par',
    usingApi: 'en utilisant l’API',
  },
  home: {
    title: 'Bonjour',
    lead: 'Cliquez sur l’option souhaitée pour les types de joueurs et le temps de réflexion.',
    or: 'OU',
    enterRoom: 'Rejoindre une salle',
    roomPrompt: 'Quelle salle souhaitez-vous rejoindre ?',
    shiftTimes: {
      none: 'Pas de limite de temps',
      five: '5 minutes',
      ten: '10 minutes',
      fifteen: '15 minutes',
      hour: '1 heure',
    },
  },
  selectSide: {
    title: (gameId) => `Choisissez un camp disponible pour jouer la partie ${gameId}`,
    join: 'Rejoindre la partie',
    noSides: 'Cette partie n’a plus de camp disponible',
  },
  promotePawn: {
    title: 'Choisissez une pièce pour promouvoir votre pion',
    select: 'Sélectionner la pièce',
  },
  answer: {
    received: {
      empate: 'Vous avez reçu une proposition de nulle',
      reset: 'Vous avez reçu une proposition de réinitialisation',
    },
    waiting: {
      empate: 'En attente de la réponse à la proposition de nulle...',
      reset: 'En attente de la réponse à la proposition de réinitialisation...',
    },
    lead: 'Cliquez sur la réponse souhaitée',
    accept: 'Accepter',
    decline: 'Refuser',
    respond: 'Répondre',
  },
  endGame: {
    proposeReset: 'Proposer une réinitialisation',
  },
  game: {
    resign: 'Abandonner',
    offerDraw: 'Proposer la nulle',
    opponentJoined: 'Votre adversaire a rejoint la partie !',
    connectionError: 'Erreur de connexion avec le serveur.',
  },
  labels: {
    sides: { 0: 'Blancs', 1: 'Noirs' },
    playerTypes: { 0: 'Humain', 1: 'IA' },
    pieces: {
      Rei: 'Roi',
      Rainha: 'Dame',
      Torre: 'Tour',
      Bispo: 'Fou',
      Cavalo: 'Cavalier',
      Peão: 'Pion',
    },
    endings: {
      'Vitória: Branco': 'Victoire des blancs',
      'Vitória: Preto': 'Victoire des noirs',
      'Empate: Regra 50 movimentos': 'Nulle : règle des 50 coups',
      'Empate: Insuficiência material': 'Nulle : matériel insuffisant',
      'Empate: Rei afogado': 'Pat',
      'Empate: Comum acordo': 'Nulle par accord mutuel',
      'Empate: Regra das 3 posições': 'Nulle : répétition de position',
      'Desistência: Um jogador deixou a partida': 'Abandon : un joueur a quitté la partie',
      'Tempo esgotado: o tempo de um jogador acabou':
        'Temps écoulé : le temps d’un joueur est épuisé',
    },
    moves: {
      'Roque Menor': 'Petit roque',
      'Roque Maior': 'Grand roque',
      'Primeiro Movimento Peão': 'Double poussée du pion',
      'Promoção do Peão': 'Promotion du pion',
      'En Passant': 'Prise en passant',
      L: 'Mouvement du cavalier',
    },
  },
  errors: {
    unexpected: 'Erreur inattendue. Veuillez réessayer.',
    noConnection: 'Impossible de joindre le serveur. Veuillez réessayer plus tard.',
    notConfigured:
      'L’adresse de l’API n’est pas configurée. Définissez VITE_API_BASE_URL puis redéployez.',
    notJson: 'L’API n’a pas répondu en JSON. Vérifiez que VITE_API_BASE_URL pointe vers l’API.',
  },
}
