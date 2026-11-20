import { useGame } from '../state/store'

/** Small messages at the top centre, for example when the secret is found. */
export function Toasts() {
  const toasts = useGame((s) => s.toasts)
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <p key={toast.id} className="toast">
          {toast.text}
        </p>
      ))}
    </div>
  )
}
