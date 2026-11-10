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
  install: {
    button: 'Installer l’application',
    iosHint: 'Pour installer, touchez Partager puis Sur l’écran d’accueil.',
  },
  home: {
    title: 'Bonjour',
    lead: 'Cliquez sur l’option souhaitée pour les types de joueurs et le temps de réflexion.',
    or: 'OU',
    enterRoom: 'Rejoindre une salle',
    roomPrompt: 'Quelle salle souhaitez-vous rejoindre ?',
    reviewGame: 'Revoir une partie',
    reviewPrompt: 'Quel est le numéro de la salle de la partie à revoir ?',
    shiftTimes: {
      five: '5 minutes',
      ten: '10 minutes',
      fifteen: '15 minutes',
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
    reviewGame: 'Revoir la partie',
  },
  material: {
    title: 'Pièces restantes',
    noMaterial: 'Aucun des deux camps n’a assez de pièces pour mater.',
    timeOut: { 0: 'Les Blancs n’ont plus de temps.', 1: 'Les Noirs n’ont plus de temps.' },
    canCheckmate: 'Peut mater',
    cannotCheckmate: 'Ne peut pas mater',
  },
  review: {
    title: 'Revue de la partie',
    room: (gameId) => `Salle ${gameId}`,
    inProgress: 'Partie en cours',
    moveList: 'Coups de la partie',
    first: 'Position de départ',
    previous: 'Coup précédent',
    next: 'Coup suivant',
    last: 'Position finale',
    position: (step, total) => `Coup ${step} sur ${total}`,
    startPosition: 'Position de départ',
    noMoves: 'Aucun coup n’a été joué dans cette partie.',
    unavailable:
      'Les coups de cette partie ne peuvent pas être rejoués : l’échiquier montre seulement la position finale.',
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
      'Empate: Tempo esgotado sem material':
        'Nulle : temps écoulé et l’adversaire ne peut pas mater',
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
