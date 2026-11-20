import type { PointerEvent } from 'react'
import { content } from '../content'
import { useGame } from '../state/store'
import { SettingsIcon, SimpleViewIcon, SoundOffIcon, SoundOnIcon } from './Icons'
import { Minimap } from './Minimap'
import { strings } from './strings'

// After a mouse or touch press, give focus back to the page so Space brakes instead of pressing the button again.
const releaseFocus = (e: PointerEvent<HTMLElement>) => e.currentTarget.blur()

export function Hud() {
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const openPanel = useGame((s) => s.openPanel)
  const activeZone = useGame((s) => s.activeZone)
  const panel = useGame((s) => s.panel)
  const hintDone = useGame((s) => s.hintDone)
  const interact = useGame((s) => s.interact)

  return (
    <div className="hud">
      <p className="hud__name">{content.start.name}</p>
      <Minimap />

      <div className="hud__buttons">
        <button
          type="button"
          className="icon-button"
          aria-label={strings.sound}
          aria-pressed={!muted}
          title={muted ? strings.soundOff : strings.soundOn}
          onClick={toggleMute}
          onPointerUp={releaseFocus}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={strings.settings}
          title={strings.settings}
          onClick={() => openPanel('settings')}
        >
          <SettingsIcon />
        </button>
        <a className="icon-button" href="simple.html" aria-label={strings.simpleView} title={strings.simpleView}>
          <SimpleViewIcon />
        </a>
      </div>

      <p className={`hud__hint${hintDone ? ' hud__hint--done' : ''}`}>{content.world.controlsHint}</p>

      {activeZone && !panel && (
        <button type="button" className="prompt" onClick={interact} onPointerUp={releaseFocus}>
          {content.world.interactPrompt} {content[activeZone].title}
        </button>
      )}
    </div>
  )
}
