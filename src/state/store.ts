import { create } from 'zustand'
import { blip, setMuted, startAudio } from '../game/audio'
import { clearInput, input } from '../game/input'
import { ZONES, type ZoneId } from '../world/layout'

export type Phase = 'loading' | 'start' | 'powering' | 'playing'
export type Quality = 'high' | 'low'
export type PanelId = ZoneId | 'settings'

export interface Toast {
  id: number
  text: string
}

interface Settings {
  quality: Quality
  compat: boolean
  muted: boolean
}

const SETTINGS_KEY = 'portfolio-settings'
const LED_STEP_MS = 250

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

function loadSettings(): Settings {
  const defaults: Settings = { quality: isTouchDevice() ? 'low' : 'high', compat: false, muted: false }
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<Settings>
    return {
      quality: saved.quality === 'high' || saved.quality === 'low' ? saved.quality : defaults.quality,
      compat: typeof saved.compat === 'boolean' ? saved.compat : defaults.compat,
      muted: typeof saved.muted === 'boolean' ? saved.muted : defaults.muted,
    }
  } catch {
    return defaults
  }
}

function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    // Storage can be blocked (private mode); settings then last for this visit only.
  }
}

interface GameState extends Settings {
  phase: Phase
  /** 0 to 1, shown on the loading screen. */
  loadProgress: number
  /** Which renderer is running: 'WebGPU' or 'WebGL 2'. */
  backend: string | null
  /** How many chip LEDs are lit (power-on sequence). */
  ledsOn: number
  activeZone: ZoneId | null
  /** The zone whose panel already opened on this visit; it re-arms once the car leaves. */
  openedZone: ZoneId | null
  panel: PanelId | null
  hintDone: boolean
  secretFound: boolean
  toasts: Toast[]

  setLoadProgress: (p: number) => void
  sceneReady: () => void
  setBackend: (b: string) => void
  start: () => void
  setActiveZone: (z: ZoneId | null) => void
  clearActiveZone: (z: ZoneId) => void
  openPanel: (p: PanelId) => void
  closePanel: () => void
  interact: () => void
  setQuality: (q: Quality) => void
  setCompat: (c: boolean) => void
  toggleMute: () => void
  resetCar: () => void
  finishHint: () => void
  findSecret: (text: string) => void
  toast: (text: string) => void
  dismissToast: (id: number) => void
}

let toastId = 0

export const useGame = create<GameState>((set, get) => {
  const persist = () => {
    const { quality, compat, muted } = get()
    saveSettings({ quality, compat, muted })
  }

  return {
    ...loadSettings(),
    phase: 'loading',
    loadProgress: 0,
    backend: null,
    ledsOn: 0,
    activeZone: null,
    openedZone: null,
    panel: null,
    hintDone: false,
    secretFound: false,
    toasts: [],

    setLoadProgress: (p) => set((s) => ({ loadProgress: Math.max(s.loadProgress, Math.min(1, p)) })),

    sceneReady: () => {
      set({ loadProgress: 1 })
      if (get().phase === 'loading') set({ phase: 'start' })
    },

    setBackend: (backend) => set({ backend }),

    start: () => {
      if (get().phase !== 'start') return
      startAudio(get().muted)
      if (prefersReducedMotion()) {
        set({ ledsOn: ZONES.length, phase: 'playing' })
        return
      }
      set({ phase: 'powering', ledsOn: 0 })
      const timer = window.setInterval(() => {
        const lit = get().ledsOn + 1
        set({ ledsOn: lit })
        if (lit >= ZONES.length) {
          window.clearInterval(timer)
          window.setTimeout(() => set({ phase: 'playing' }), LED_STEP_MS)
        }
      }, LED_STEP_MS)
    },

    setActiveZone: (activeZone) => {
      set({ activeZone })
      // Driving into a chip's area opens its panel automatically, once per visit.
      const { phase, panel, openedZone, openPanel } = get()
      if (activeZone && activeZone !== openedZone && phase === 'playing' && panel === null) {
        set({ openedZone: activeZone })
        openPanel(activeZone)
      }
    },
    clearActiveZone: (zone) => {
      const { activeZone, openedZone } = get()
      if (activeZone === zone) set({ activeZone: null })
      if (openedZone === zone) set({ openedZone: null })
    },

    openPanel: (panel) => {
      if (get().phase !== 'playing') return
      clearInput()
      blip()
      set({ panel })
    },
    closePanel: () => set({ panel: null }),

    interact: () => {
      const { activeZone, panel, openPanel } = get()
      if (activeZone && !panel) openPanel(activeZone)
    },

    setQuality: (quality) => {
      set({ quality })
      persist()
    },
    setCompat: (compat) => {
      // The canvas remounts with the other renderer, so the car is no longer inside any zone.
      set({ compat, activeZone: null, openedZone: null, backend: null })
      persist()
    },
    toggleMute: () => {
      const muted = !get().muted
      set({ muted })
      setMuted(muted)
      persist()
    },

    resetCar: () => {
      input.reset = true
    },

    finishHint: () => {
      if (!get().hintDone) set({ hintDone: true })
    },

    findSecret: (text) => {
      if (get().secretFound) return
      set({ secretFound: true })
      get().toast(text)
    },

    toast: (text) => {
      const id = ++toastId
      set((s) => ({ toasts: [...s.toasts, { id, text }] }))
      window.setTimeout(() => get().dismissToast(id), 5000)
    },
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  }
})
