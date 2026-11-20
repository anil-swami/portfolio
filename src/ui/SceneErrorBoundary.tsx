import { Component, type ReactNode } from 'react'
import { content } from '../content'
import { strings } from './strings'

/** If the 3D world cannot start at all, point the visitor to the simple view instead of a blank page. */
export class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[portfolio] The 3D world failed to start.', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="screen screen--solid">
        <div className="screen__body">
          <h1 className="screen__name">{content.start.name}</h1>
          <p className="screen__intro">{strings.sceneError}</p>
          <div className="screen__actions">
            <a className="button button--primary" href="simple.html">
              {strings.sceneErrorAction}
            </a>
          </div>
        </div>
      </main>
    )
  }
}
