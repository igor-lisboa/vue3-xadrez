import type { GameSummary } from '@/api/types/game-summary'
import type { SideId } from '@/api/types/enums'

type Sound = 'myMove' | 'opponentMove' | 'capture' | 'turn' | 'promotion' | 'draw'

const tones: Record<Sound, number[]> = {
  myMove: [440, 554],
  opponentMove: [392],
  capture: [740, 554, 370],
  turn: [494, 587],
  promotion: [440, 554, 659],
  draw: [392, 494],
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
      const start = audio.currentTime + index * (sound === 'capture' ? 0.075 : 0.11)
      oscillator.type = sound === 'capture' ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(sound === 'capture' ? 0.045 : 0.035, start + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (sound === 'capture' ? 0.16 : 0.19))
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start(start)
      oscillator.stop(start + (sound === 'capture' ? 0.18 : 0.2))
    })
  }

  function changed(previous: GameSummary | null, current: GameSummary, sideId: SideId): void {
    if (!previous) return
    const oldBoard = previous.tabuleiro.flat()
    const newBoard = current.tabuleiro.flat()
    if (oldBoard.some((cell, index) => cell !== newBoard[index])) {
      const oldPieces = oldBoard.filter(Boolean).length
      const newPieces = newBoard.filter(Boolean).length
      const captured = newPieces < oldPieces
      let sound: Sound
      if (captured) sound = 'capture'
      else if (previous.ladoIdAtual === sideId) sound = 'myMove'
      else sound = 'opponentMove'
      play(sound)
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
