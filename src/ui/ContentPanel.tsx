import type { ReactNode } from 'react'
import { content } from '../content'
import { useGame } from '../state/store'
import type { ZoneId } from '../world/layout'
import { Panel } from './Panel'
import { AboutPanel } from './panels/AboutPanel'
import { ContactPanel } from './panels/ContactPanel'
import { ExperiencePanel } from './panels/ExperiencePanel'
import { ProjectsPanel } from './panels/ProjectsPanel'
import { SkillsPanel } from './panels/SkillsPanel'

const BODIES: Record<ZoneId, () => ReactNode> = {
  about: AboutPanel,
  skills: SkillsPanel,
  projects: ProjectsPanel,
  experience: ExperiencePanel,
  contact: ContactPanel,
}

/** Shows the panel for the zone the visitor opened. All text comes from content/portfolio.json. */
export function ContentPanel() {
  const panel = useGame((s) => s.panel)
  const closePanel = useGame((s) => s.closePanel)
  if (!panel || panel === 'settings') return null
  const Body = BODIES[panel]

  return (
    <Panel key={panel} title={content[panel].title} onClose={closePanel}>
      <Body />
    </Panel>
  )
}
