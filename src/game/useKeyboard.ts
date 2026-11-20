import { useEffect } from 'react'
import { useGame } from '../state/store'
import { clearInput, input, type HeldKey } from './input'

const HELD: Record<string, HeldKey> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'boost',
  ShiftRight: 'boost',
  Space: 'brake',
}

const isControl = (el: EventTarget | null): boolean =>
  el instanceof HTMLElement && el.closest('button, a, input, select, textarea, [role="dialog"]') !== null

/** Wires the keyboard to the input object and to the game actions (E, R, M, Esc). */
export function useKeyboard(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const game = useGame.getState()

      if (e.code === 'Escape') {
        if (game.panel) {
          e.preventDefault()
          game.closePanel()
        }
        return
      }
      if (game.phase !== 'playing') return

      if (e.code === 'KeyM' && !e.repeat) {
        game.toggleMute()
        return
      }
      // While a panel is open the keys belong to the panel, not the car.
      if (game.panel) return

      const held = HELD[e.code]
      if (held) {
        // Space and Enter on a focused button should press that button, not brake.
        if (e.code === 'Space' && isControl(e.target)) return
        input[held] = true
        if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault()
        return
      }
      if (e.repeat) return
      if (e.code === 'KeyE') game.interact()
      else if (e.code === 'KeyR') game.resetCar()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const held = HELD[e.code]
      if (held) input[held] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearInput)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearInput)
    }
  }, [])
}
