/** Web Audio sounds: an engine hum that follows speed, and a short blip. No audio files. */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let engineOsc: OscillatorNode | null = null
let engineFilter: BiquadFilterNode | null = null
let engineGain: GainNode | null = null
let muted = false

const MASTER_LEVEL = 0.6

/** Must be called from a user gesture (the Start click) because of autoplay rules. */
export function startAudio(isMuted: boolean): void {
  muted = isMuted
  if (ctx) {
    void ctx.resume()
    return
  }
  const AudioCtor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return

  try {
    ctx = new AudioCtor()
  } catch {
    return
  }
  master = ctx.createGain()
  master.gain.value = muted ? 0 : MASTER_LEVEL
  master.connect(ctx.destination)

  engineOsc = ctx.createOscillator()
  engineOsc.type = 'sawtooth'
  engineOsc.frequency.value = 45
  engineFilter = ctx.createBiquadFilter()
  engineFilter.type = 'lowpass'
  engineFilter.frequency.value = 260
  engineGain = ctx.createGain()
  engineGain.gain.value = 0
  engineOsc.connect(engineFilter).connect(engineGain).connect(master)
  engineOsc.start()

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) void ctx.suspend()
    else void ctx.resume()
  })
}

export function setMuted(isMuted: boolean): void {
  muted = isMuted
  if (ctx && master) master.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, ctx.currentTime, 0.03)
}

/** Call every frame. `speed` is in m/s; `active` is false while the car is parked (panels, start screen). */
export function updateEngine(speed: number, active: boolean): void {
  if (!ctx || !engineOsc || !engineFilter || !engineGain) return
  const s = Math.min(Math.abs(speed), 26)
  const t = ctx.currentTime
  engineOsc.frequency.setTargetAtTime(45 + s * 5.5, t, 0.08)
  engineFilter.frequency.setTargetAtTime(240 + s * 45, t, 0.08)
  engineGain.gain.setTargetAtTime(active ? 0.035 + (s / 26) * 0.075 : 0, t, 0.12)
}

/** Short two-note blip, used when a panel opens. */
export function blip(): void {
  if (!ctx || !master || muted) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(620, t)
  osc.frequency.setValueAtTime(930, t + 0.07)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.22)
}
