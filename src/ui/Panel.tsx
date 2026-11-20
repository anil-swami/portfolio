import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { CloseIcon } from './Icons'
import { strings } from './strings'

interface PanelProps {
  title: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A modal side panel: slides in from the right on desktop and from the bottom on mobile.
 * Focus moves in when it opens, stays inside while it is open, and returns when it closes.
 * Esc is handled globally (useKeyboard); clicking outside closes it too.
 */
export function Panel({ title, onClose, children }: PanelProps) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus({ preventScroll: true })
    return () => {
      if (previous && previous !== document.body && document.contains(previous)) previous.focus({ preventScroll: true })
    }
  }, [])

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panel.current) return
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const current = document.activeElement
    if (e.shiftKey && (current === first || current === panel.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && current === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="panel-layer">
      <div className="panel-backdrop" onClick={onClose} />
      <div
        ref={panel}
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapFocus}
      >
        <header className="panel__header">
          <h2 id={titleId} className="panel__title">
            {title}
          </h2>
          <button type="button" className="icon-button" aria-label={strings.close} title={strings.close} onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="panel__body">{children}</div>
      </div>
    </div>
  )
}
