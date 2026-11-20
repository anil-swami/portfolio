import { useEffect, useState, type ReactNode } from 'react'
import { input, type HeldKey } from '../game/input'
import { useGame } from '../state/store'
import { ArrowIcon } from './Icons'
import { strings } from './strings'

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return coarse
}

interface HoldButtonProps {
  action: HeldKey
  label: string
  className?: string
  children: ReactNode
}

/** A button that holds an input down while it is pressed, exactly like a key. */
function HoldButton({ action, label, className = '', children }: HoldButtonProps) {
  const set = (value: boolean) => () => {
    input[action] = value
  }
  return (
    <button
      type="button"
      className={`touch-button ${className}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        input[action] = true
      }}
      onPointerUp={set(false)}
      onPointerCancel={set(false)}
      onLostPointerCapture={set(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}

/** On-screen driving buttons, only on touch devices. They write to the same input object as the keyboard. */
export function TouchControls() {
  const coarse = useCoarsePointer()
  const panel = useGame((s) => s.panel)
  const activeZone = useGame((s) => s.activeZone)
  const interact = useGame((s) => s.interact)

  if (!coarse || panel) return null

  return (
    <div className="touch">
      <div className="touch__group">
        <HoldButton action="left" label={strings.steerLeft}>
          <ArrowIcon direction="left" />
        </HoldButton>
        <HoldButton action="right" label={strings.steerRight}>
          <ArrowIcon direction="right" />
        </HoldButton>
      </div>
      <div className="touch__group touch__group--right">
        <button
          type="button"
          className={`touch-button touch-button--interact${activeZone ? ' touch-button--ready' : ''}`}
          aria-label={strings.interactLabel}
          disabled={!activeZone}
          onClick={interact}
        >
          {strings.interact}
        </button>
        <HoldButton action="brakeReverse" label={strings.brakeLabel}>
          {strings.brake}
        </HoldButton>
        <HoldButton action="forward" label={strings.gas} className="touch-button--gas">
          {strings.gas}
        </HoldButton>
      </div>
    </div>
  )
}
