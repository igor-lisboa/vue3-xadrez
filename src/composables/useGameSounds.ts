import type { GameSummary } from '@/api/types/game-summary'

type Sound = 'move' | 'capture' | 'turn' | 'promotion' | 'draw'

const tones: Record<Sound, number[]> = {
  move: [440],
  capture: [330, 220],
  turn: [587, 784],
  promotion: [523, 659, 784],
  draw: [392, 523],
}

/** Generates short interface sounds without downloading or caching audio files. */
export function useGameSounds() {
  let context: AudioContext | null = null

  function play(sound: Sound): void {
    if (typeof AudioContext === 'undefined') return
    context ??= new AudioContext()
    const audio = context
    if (audio.state === 'suspended') void audio.resume()

    tones[sound].forEach((frequency, index) => {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      const start = audio.currentTime + index * 0.11
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13)
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.14)
    })
  }

  function changed(previous: GameSummary | null, current: GameSummary): void {
    if (!previous) return
    const oldBoard = previous.tabuleiro.flat()
    const newBoard = current.tabuleiro.flat()
    if (oldBoard.some((cell, index) => cell !== newBoard[index])) {
      const oldPieces = oldBoard.filter(Boolean).length
      const newPieces = newBoard.filter(Boolean).length
      play(newPieces < oldPieces ? 'capture' : 'move')
    }
    if (previous.ladoIdAtual !== current.ladoIdAtual) play('turn')

    const wasPromoting = previous.acoesSolicitadas.some(
      (action) => action.acao === 'promocaoPeao',
    )
    const isPromoting = current.acoesSolicitadas.some(
      (action) => action.acao === 'promocaoPeao',
    )
    if (!wasPromoting && isPromoting) play('promotion')

    if (previous.empatePropostoPeloLadoId === null && current.empatePropostoPeloLadoId !== null) {
      play('draw')
    }
  }

  return { play, changed }
}
