import { content } from '../../content'
import { strings } from '../strings'
import { Tags } from './Tags'

export function SkillsPanel() {
  const { zones, stack } = content.skills
  return (
    <>
      <dl className="pairs">
        {zones.map((zone) => (
          <div key={zone.name}>
            <dt>{zone.name}</dt>
            <dd>{zone.line}</dd>
          </div>
        ))}
      </dl>
      <h3>{strings.stack}</h3>
      <dl className="stack">
        {stack.map((group) => (
          <div key={group.group}>
            <dt>{group.group}</dt>
            <dd>
              <Tags items={group.items} />
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
