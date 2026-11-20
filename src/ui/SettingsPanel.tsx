import { content } from '../content'
import { useGame, type Quality } from '../state/store'
import { Panel } from './Panel'
import { strings } from './strings'

const QUALITIES: { value: Quality; label: string; hint: string }[] = [
  { value: 'high', label: strings.qualityHigh, hint: strings.qualityHighHint },
  { value: 'low', label: strings.qualityLow, hint: strings.qualityLowHint },
]

export function SettingsPanel() {
  const open = useGame((s) => s.panel === 'settings')
  const closePanel = useGame((s) => s.closePanel)
  const quality = useGame((s) => s.quality)
  const setQuality = useGame((s) => s.setQuality)
  const compat = useGame((s) => s.compat)
  const setCompat = useGame((s) => s.setCompat)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const resetCar = useGame((s) => s.resetCar)
  const backend = useGame((s) => s.backend)

  if (!open) return null

  return (
    <Panel title={strings.settings} onClose={closePanel}>
      <fieldset className="setting">
        <legend>{strings.quality}</legend>
        <div className="choices">
          {QUALITIES.map((q) => (
            <label key={q.value} className="choice">
              <input type="radio" name="quality" checked={quality === q.value} onChange={() => setQuality(q.value)} />
              <span>
                <strong>{q.label}</strong>
                <small>{q.hint}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="setting switch">
        <span>
          <strong>{strings.compat}</strong>
          <small>{strings.compatHint}</small>
        </span>
        <input type="checkbox" role="switch" checked={compat} onChange={(e) => setCompat(e.target.checked)} />
      </label>

      <label className="setting switch">
        <span>
          <strong>{strings.sound}</strong>
        </span>
        <input type="checkbox" role="switch" checked={!muted} onChange={toggleMute} />
      </label>

      <div className="setting">
        <button
          type="button"
          className="button"
          onClick={() => {
            resetCar()
            closePanel()
          }}
        >
          {strings.resetCar}
        </button>
      </div>

      <h3>{strings.credits}</h3>
      <p>{content.world.credits}</p>
      {backend && (
        <p className="meta">
          {strings.renderer}: {backend}
        </p>
      )}
    </Panel>
  )
}
