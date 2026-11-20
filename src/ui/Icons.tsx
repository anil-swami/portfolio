import type { ReactNode } from 'react'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const SoundOnIcon = () => (
  <Icon>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 6a8.5 8.5 0 0 1 0 12" />
  </Icon>
)

export const SoundOffIcon = () => (
  <Icon>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M17 9.5l5 5M22 9.5l-5 5" />
  </Icon>
)

export const SettingsIcon = () => (
  <Icon>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
)

export const SimpleViewIcon = () => (
  <Icon>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </Icon>
)

export const CloseIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const ArrowIcon = ({ direction }: { direction: 'left' | 'right' | 'up' | 'down' }) => {
  const turn = { up: 0, right: 90, down: 180, left: 270 }[direction]
  return (
    <Icon>
      <path d="M12 19V5M6 11l6-6 6 6" transform={`rotate(${turn} 12 12)`} />
    </Icon>
  )
}
