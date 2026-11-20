/** Web Audio sounds: an engine hum that follows speed, a short blip, and forest ambience (wind and birdsong). No audio files. */

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

  startAmbience(ctx, master)

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

const WIND_LEVEL = 0.05
const CHIRP_LEVEL = 0.05

/** A soft wind (filtered noise that slowly swells) and a bird call every few seconds. */
function startAmbience(audio: AudioContext, out: GainNode): void {
  // Two seconds of noise, looped, through a low band-pass filter
  const length = audio.sampleRate * 2
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const noise = audio.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  const band = audio.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 420
  band.Q.value = 0.6
  const wind = audio.createGain()
  wind.gain.value = WIND_LEVEL
  // A very slow oscillator makes the wind rise and fall
  const gust = audio.createOscillator()
  gust.frequency.value = 0.08
  const gustDepth = audio.createGain()
  gustDepth.gain.value = WIND_LEVEL * 0.6
  gust.connect(gustDepth).connect(wind.gain)
  noise.connect(band).connect(wind).connect(out)
  noise.start()
  gust.start()

  const scheduleChirp = () => {
    window.setTimeout(() => {
      if (audio.state === 'running' && !muted) chirp(audio, out)
      scheduleChirp()
    }, 2500 + Math.random() * 5500)
  }
  scheduleChirp()
}

/** One short bird call: two to four quick rising and falling whistles. */
function chirp(audio: AudioContext, out: GainNode): void {
  const notes = 2 + Math.floor(Math.random() * 3)
  const pitch = 2200 + Math.random() * 1600
  // Pan each bird somewhere around the listener
  const pan = audio.createStereoPanner()
  pan.pan.value = Math.random() * 1.6 - 0.8
  pan.connect(out)
  let t = audio.currentTime + 0.02
  for (let i = 0; i < notes; i++) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    const length = 0.07 + Math.random() * 0.06
    osc.frequency.setValueAtTime(pitch, t)
    osc.frequency.exponentialRampToValueAtTime(pitch * (1.25 + Math.random() * 0.3), t + length * 0.5)
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.9, t + length)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(CHIRP_LEVEL, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
    osc.connect(gain).connect(pan)
    osc.start(t)
    osc.stop(t + length + 0.02)
    t += length + 0.04 + Math.random() * 0.05
  }
}
