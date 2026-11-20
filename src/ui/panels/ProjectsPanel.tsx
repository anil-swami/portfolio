import { content } from '../../content'
import { Tags } from './Tags'

export function ProjectsPanel() {
  return (
    <ul className="cards">
      {content.projects.items.map((project) => (
        <li key={project.name}>
          <h3>{project.name}</h3>
          <p>{project.line}</p>
          <Tags items={project.tags} />
        </li>
      ))}
    </ul>
  )
}
