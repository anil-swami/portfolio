import { content } from '../../content'

export function AboutPanel() {
  return (
    <>
      {content.about.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  )
}
