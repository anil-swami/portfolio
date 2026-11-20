import { content } from '../../content'
import { strings } from '../strings'

export function ExperiencePanel() {
  const { roles, education } = content.experience
  return (
    <>
      <ul className="cards">
        {roles.map((role) => (
          <li key={role.title}>
            <h3>{role.title}</h3>
            <p className="meta">
              {role.where}, {role.period}
            </p>
            <p>{role.line}</p>
          </li>
        ))}
      </ul>
      <h3>{strings.education}</h3>
      <ul className="education">
        {education.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <span className="meta">{item.year}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
