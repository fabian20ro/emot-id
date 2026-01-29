import { useCallback, useRef } from 'react'

type SoundType = 'select' | 'deselect'

const frequencies: Record<SoundType, number> = {
  select: 523.25, // C5
  deselect: 392.0, // G4
}

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback(
    (type: SoundType) => {
      try {
        const ctx = getAudioContext()

        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = 'sine'
        oscillator.frequency.value = frequencies[type]

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.15)
      } catch {
        // Web Audio API not available, fail silently
      }
    },
    [getAudioContext]
  )

  return { playSound }
}
