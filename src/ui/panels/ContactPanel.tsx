import { content } from '../../content'
import { useGame } from '../../state/store'
import { strings } from '../strings'

export function ContactPanel() {
  const toast = useGame((s) => s.toast)
  const { line, email, linkedin, github, resumePdf } = content.contact

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      toast(strings.emailCopied)
    } catch {
      // Clipboard can be blocked; the address is still visible and selectable.
    }
  }

  return (
    <>
      <p className="lead">{line}</p>
      <ul className="contact">
        <li>
          <span className="meta">{strings.email}</span>
          <a href={`mailto:${email}`}>{email}</a>
          <button type="button" className="button button--small" onClick={copyEmail}>
            {strings.copyEmail}
          </button>
        </li>
        {/* Empty strings in portfolio.json mean "hide this item" */}
        {linkedin && (
          <li>
            <span className="meta">{strings.linkedin}</span>
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              {linkedin.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </li>
        )}
        {github && (
          <li>
            <span className="meta">{strings.github}</span>
            <a href={github} target="_blank" rel="noopener noreferrer">
              {github.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </li>
        )}
        {resumePdf && (
          <li>
            <span className="meta">{strings.resume}</span>
            <a href={resumePdf} target="_blank" rel="noopener noreferrer">
              {strings.downloadResume}
            </a>
          </li>
        )}
      </ul>
    </>
  )
}
