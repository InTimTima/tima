const MUTE_KEY = 'tima-muted'
const BPM = 86
const STEP = 60 / BPM / 4

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function saveMuted(value: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function fillNoise(buffer: AudioBuffer, decay = 0) {
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) {
      const env = decay > 0 ? Math.pow(1 - i / data.length, decay) : 1
      data[i] = (Math.random() * 2 - 1) * env
    }
  }
}

const KICK = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0]
const SNARE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
const HAT = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0]
const BASS = [55, 0, 0, 55, 0, 0, 65.41, 0, 55, 0, 0, 49, 43.65, 0, 55, 0]
const LEAD = [0, 0, 440, 0, 0, 0, 523.25, 0, 0, 392, 0, 0, 329.63, 0, 440, 0]
const CHORDS = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [220, 261.63, 329.63],
  [196, 246.94, 293.66],
]

class CosmicAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private music: GainNode | null = null
  private sfx: GainNode | null = null
  private rumbleFilter: BiquadFilterNode | null = null
  private rumbleGain: GainNode | null = null
  private windGain: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private padFilter: BiquadFilterNode | null = null
  private noise: AudioBuffer | null = null
  private started = false
  private muted = loadMuted()
  private lastWarp = 0
  private whooshAt = 0
  private step = 0
  private nextTime = 0
  private listeners = new Set<(muted: boolean) => void>()

  isMuted() {
    return this.muted
  }

  subscribe(fn: (muted: boolean) => void) {
    this.listeners.add(fn)
    fn(this.muted)
    return () => {
      this.listeners.delete(fn)
    }
  }

  setMuted(value: boolean) {
    this.muted = value
    saveMuted(value)
    this.applyMute()
    this.listeners.forEach((fn) => fn(value))
    if (!value) void this.unlock()
  }

  toggle() {
    this.setMuted(!this.muted)
  }

  async unlock() {
    if (this.muted) return
    const ctx = this.ensure()
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        return
      }
    }
    if (!this.started) this.startGraph()
  }

  setMotion(speed: number, warp: number) {
    if (!this.started || !this.ctx || this.muted) {
      this.lastWarp = warp
      return
    }
    const now = this.ctx.currentTime
    const rumble = 0.012 + Math.min(speed, 6) * 0.012 + warp * 0.1
    const wind = 0.006 + warp * 0.14
    this.rumbleGain?.gain.setTargetAtTime(rumble, now, 0.08)
    this.windGain?.gain.setTargetAtTime(wind, now, 0.1)
    this.rumbleFilter?.frequency.setTargetAtTime(90 + warp * 140, now, 0.1)
    this.windFilter?.frequency.setTargetAtTime(220 + warp * 2200 + Math.min(speed, 6) * 80, now, 0.08)
    this.padFilter?.frequency.setTargetAtTime(900 + warp * 1600, now, 0.12)

    if (warp > 0.42 && this.lastWarp <= 0.42) this.whoosh(0.7 + warp * 0.4)
    if (warp > 0.78 && this.lastWarp <= 0.78) this.whoosh(1)
    if (warp > 0.22 && warp - this.lastWarp > 0.18) this.whoosh(0.45 + warp * 0.3)
    this.lastWarp = warp
  }

  navPing() {
    void this.unlock()
    if (!this.ctx || !this.sfx || this.muted) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    osc.type = 'sine'
    osc2.type = 'triangle'
    osc.frequency.setValueAtTime(660, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18)
    osc2.frequency.setValueAtTime(990, now)
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.22)
    filter.type = 'highpass'
    filter.frequency.value = 420
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
    osc.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfx)
    osc.start(now)
    osc2.start(now)
    osc.stop(now + 0.34)
    osc2.stop(now + 0.34)
  }

  private whoosh(intensity: number) {
    if (!this.ctx || !this.sfx || this.muted) return
    const now = this.ctx.currentTime
    if (now - this.whooshAt < 0.28) return
    this.whooshAt = now
    const ctx = this.ctx
    const dur = 0.9 + intensity * 0.5
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
    fillNoise(buffer, 1.6)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 2.4
    filter.frequency.setValueAtTime(280, now)
    filter.frequency.exponentialRampToValueAtTime(2400 + intensity * 1800, now + dur * 0.45)
    filter.frequency.exponentialRampToValueAtTime(180, now + dur)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.2 * intensity, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(48, now)
    osc.frequency.exponentialRampToValueAtTime(220 + intensity * 90, now + dur * 0.4)
    osc.frequency.exponentialRampToValueAtTime(36, now + dur)
    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.0001, now)
    oscGain.gain.exponentialRampToValueAtTime(0.06 * intensity, now + 0.05)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    const oscFilter = ctx.createBiquadFilter()
    oscFilter.type = 'lowpass'
    oscFilter.frequency.value = 600
    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfx)
    osc.connect(oscFilter)
    oscFilter.connect(oscGain)
    oscGain.connect(this.sfx)
    src.start(now)
    osc.start(now)
    src.stop(now + dur)
    osc.stop(now + dur)
  }

  private ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
    }
    return this.ctx
  }

  private applyMute() {
    if (!this.master || !this.ctx) return
    this.master.gain.setTargetAtTime(this.muted ? 0 : 0.88, this.ctx.currentTime, 0.08)
  }

  private startGraph() {
    const ctx = this.ensure()
    this.started = true

    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.88
    this.master.connect(ctx.destination)

    this.music = ctx.createGain()
    this.music.gain.value = 0.78
    this.sfx = ctx.createGain()
    this.sfx.gain.value = 0.9

    const convolver = ctx.createConvolver()
    const ir = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 1.6), ctx.sampleRate)
    fillNoise(ir, 2.6)
    convolver.buffer = ir
    const wet = ctx.createGain()
    wet.gain.value = 0.22
    const dry = ctx.createGain()
    dry.gain.value = 0.82
    this.music.connect(dry)
    this.music.connect(convolver)
    convolver.connect(wet)
    dry.connect(this.master)
    wet.connect(this.master)
    this.sfx.connect(this.master)

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    fillNoise(this.noise)

    this.rumbleFilter = ctx.createBiquadFilter()
    this.rumbleFilter.type = 'lowpass'
    this.rumbleFilter.frequency.value = 90
    this.rumbleGain = ctx.createGain()
    this.rumbleGain.gain.value = 0.012
    const rumble = ctx.createOscillator()
    rumble.type = 'sawtooth'
    rumble.frequency.value = 42
    rumble.connect(this.rumbleFilter)
    this.rumbleFilter.connect(this.rumbleGain)
    this.rumbleGain.connect(this.master)

    const wind = ctx.createBufferSource()
    wind.buffer = this.noise
    wind.loop = true
    this.windFilter = ctx.createBiquadFilter()
    this.windFilter.type = 'bandpass'
    this.windFilter.frequency.value = 400
    this.windFilter.Q.value = 0.7
    this.windGain = ctx.createGain()
    this.windGain.gain.value = 0.006
    wind.connect(this.windFilter)
    this.windFilter.connect(this.windGain)
    this.windGain.connect(this.master)

    this.padFilter = ctx.createBiquadFilter()
    this.padFilter.type = 'lowpass'
    this.padFilter.frequency.value = 980
    this.padFilter.Q.value = 0.55
    const padGain = ctx.createGain()
    padGain.gain.value = 0.028
    const padNotes = [110, 164.81, 220]
    padNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = freq
      osc.detune.value = i === 1 ? 7 : i === 2 ? -6 : 0
      osc.connect(this.padFilter!)
      osc.start()
    })
    this.padFilter.connect(padGain)
    padGain.connect(this.music)

    rumble.start()
    wind.start()

    this.nextTime = ctx.currentTime + 0.06
    window.setInterval(() => this.schedule(), 40)
  }

  private schedule() {
    const ctx = this.ctx
    if (!ctx || !this.started) return
    const horizon = ctx.currentTime + 0.14
    while (this.nextTime < horizon) {
      if (!this.muted) this.playStep(this.step, this.nextTime)
      this.step = (this.step + 1) % 16
      this.nextTime += STEP
    }
  }

  private playStep(step: number, time: number) {
    const dest = this.music
    const ctx = this.ctx
    if (!ctx || !dest || !this.noise) return

    if (KICK[step]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(150, time)
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.12)
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.34, time + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28)
      osc.connect(gain)
      gain.connect(dest)
      osc.start(time)
      osc.stop(time + 0.3)
    }

    if (SNARE[step]) {
      const src = ctx.createBufferSource()
      src.buffer = this.noise
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1800
      filter.Q.value = 0.9
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.16, time + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16)
      const tone = ctx.createOscillator()
      tone.type = 'triangle'
      tone.frequency.value = 196
      const toneGain = ctx.createGain()
      toneGain.gain.setValueAtTime(0.07, time)
      toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12)
      src.connect(filter)
      filter.connect(gain)
      gain.connect(dest)
      tone.connect(toneGain)
      toneGain.connect(dest)
      src.start(time)
      src.stop(time + 0.18)
      tone.start(time)
      tone.stop(time + 0.14)
    }

    if (HAT[step]) {
      const src = ctx.createBufferSource()
      src.buffer = this.noise
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 7000
      const gain = ctx.createGain()
      const open = step === 7 || step === 15
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(open ? 0.045 : 0.028, time + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + (open ? 0.12 : 0.04))
      src.connect(filter)
      filter.connect(gain)
      gain.connect(dest)
      src.start(time)
      src.stop(time + 0.14)
    }

    const bass = BASS[step]
    if (bass) {
      const osc = ctx.createOscillator()
      const sub = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = 'square'
      sub.type = 'sine'
      osc.frequency.setValueAtTime(bass, time)
      sub.frequency.setValueAtTime(bass / 2, time)
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(520, time)
      filter.frequency.exponentialRampToValueAtTime(140, time + 0.22)
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.16, time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.32)
      osc.connect(filter)
      sub.connect(filter)
      filter.connect(gain)
      gain.connect(dest)
      osc.start(time)
      sub.start(time)
      osc.stop(time + 0.34)
      sub.stop(time + 0.34)
    }

    if (step % 8 === 0) {
      const chord = CHORDS[(step / 8 + Math.floor(this.nextTime / (STEP * 16))) % CHORDS.length]
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.value = freq
        osc.detune.value = i === 1 ? 8 : 0
        gain.gain.setValueAtTime(0.0001, time)
        gain.gain.exponentialRampToValueAtTime(0.035, time + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.7)
        osc.connect(gain)
        gain.connect(dest)
        osc.start(time)
        osc.stop(time + 0.72)
      })
    }

    const lead = LEAD[step]
    if (lead && Math.floor(this.nextTime / (STEP * 16)) % 2 === 0) {
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(lead, time)
      filter.type = 'lowpass'
      filter.frequency.value = 2200
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.05, time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(dest)
      osc.start(time)
      osc.stop(time + 0.3)
    }
  }
}

export const audio = new CosmicAudio()
