import { useEffect, useState } from 'react'
import { content } from '../content'
import { useGame } from '../state/store'

const LINE_MS = 1600

export function LoadingScreen() {
  const progress = useGame((s) => s.loadProgress)
  const lines = content.world.loadingLines
  const [line, setLine] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setLine((i) => Math.min(i + 1, lines.length - 1)), LINE_MS)
    return () => window.clearInterval(timer)
  }, [lines.length])

  return (
    <div className="screen screen--solid" role="status" aria-live="polite">
      <div className="loading">
        <p className="loading__line">{lines[line]}</p>
        <div
          className="loading__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className="loading__fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  )
}
