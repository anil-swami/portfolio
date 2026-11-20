import { useEffect, useRef } from 'react'
import { content } from '../content'
import { useGame } from '../state/store'

export function StartScreen() {
  const start = useGame((s) => s.start)
  const button = useRef<HTMLButtonElement>(null)
  const { name, roles, intro, button: startLabel, simpleViewButton } = content.start

  useEffect(() => button.current?.focus({ preventScroll: true }), [])

  return (
    <main className="screen screen--dim">
      <div className="screen__body">
        <h1 className="screen__name">{name}</h1>
        <ul className="screen__roles">
          {roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
        <p className="screen__intro">{intro}</p>
        <div className="screen__actions">
          <button ref={button} type="button" className="button button--primary" onClick={start}>
            {startLabel}
          </button>
          <a className="link" href="simple.html">
            {simpleViewButton}
          </a>
        </div>
      </div>
    </main>
  )
}
