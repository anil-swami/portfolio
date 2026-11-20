import { lazy, Suspense } from 'react'
import { useKeyboard } from './game/useKeyboard'
import { useGame } from './state/store'
import { ContentPanel } from './ui/ContentPanel'
import { Hud } from './ui/Hud'
import { LoadingScreen } from './ui/LoadingScreen'
import { SceneErrorBoundary } from './ui/SceneErrorBoundary'
import { SettingsPanel } from './ui/SettingsPanel'
import { StartScreen } from './ui/StartScreen'
import { Toasts } from './ui/Toasts'
import { TouchControls } from './ui/TouchControls'

// The 3D world (three.js, physics) loads as its own chunk, so the first paint stays light.
const Scene = lazy(() => import('./scene/Scene'))

export function App() {
  useKeyboard()
  const phase = useGame((s) => s.phase)

  return (
    <SceneErrorBoundary>
      <div className="stage" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      {phase === 'loading' && <LoadingScreen />}
      {phase === 'start' && <StartScreen />}
      {phase === 'playing' && (
        <>
          <Hud />
          <TouchControls />
        </>
      )}
      <ContentPanel />
      <SettingsPanel />
      <Toasts />
    </SceneErrorBoundary>
  )
}
