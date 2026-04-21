// Web Audio API chiptune background music for the race game

const e = 0.20, q = 0.40, h = 0.80

const MELODY = [
  // Phrase 1 — montée énergique
  [659, e], [784, e], [880, e], [1047, q], [880, e], [784, e],
  [659, q], [523, e], [659, e], [784, q], [784, q],
  // Phrase 2 — accalmie
  [880, e], [784, e], [659, e], [784, e], [880, h],
  [784, e], [659, e], [587, e], [523, e], [659, q], [392, q],
  // Phrase 3 — tension
  [523, e], [659, e], [784, e], [880, e], [1047, q], [880, q],
  [784, e], [880, e], [784, e], [659, e], [784, h],
  // Phrase 4 — résolution
  [659, e], [587, e], [523, e], [659, e], [880, q], [784, q],
  [523, e], [659, e], [784, e], [523, e], [659, h],
]

const BASS = [
  [131, q], [165, q], [196, q], [131, q],
  [110, q], [131, q], [165, q], [196, q],
  [131, q], [165, q], [196, q], [262, q],
  [196, q], [165, q], [131, q], [110, q],
]

export class GameMusic {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.isPlaying = false
    this._timer = null
    this._melodyIdx = 0
    this._bassIdx = 0
    this._melodyTime = 0
    this._bassTime = 0
  }

  start() {
    if (this.isPlaying) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.18
    this.masterGain.connect(this.ctx.destination)

    this.isPlaying = true
    this._melodyIdx = 0
    this._bassIdx = 0
    this._melodyTime = this.ctx.currentTime + 0.05
    this._bassTime = this.ctx.currentTime + 0.05

    this._schedule()
  }

  stop() {
    if (!this.isPlaying) return
    this.isPlaying = false
    clearTimeout(this._timer)

    const g = this.masterGain
    g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3)
    setTimeout(() => this.ctx && this.ctx.close(), 800)
    this.ctx = null
    this.masterGain = null
  }

  _playNote(freq, duration, type = 'square', gainLevel = 0.3) {
    if (freq === 0 || !this.ctx) return
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    const t = type === 'square' ? this._melodyTime : this._bassTime
    env.gain.setValueAtTime(gainLevel, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.85)
    osc.connect(env)
    env.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + duration)
  }

  _schedule() {
    if (!this.isPlaying || !this.ctx) return
    const lookahead = 0.08
    const scheduleWindow = 0.3

    // Melody (square wave)
    while (this._melodyTime < this.ctx.currentTime + scheduleWindow) {
      const [freq, dur] = MELODY[this._melodyIdx % MELODY.length]
      this._playNote(freq, dur, 'square', 0.28)
      this._melodyTime += dur
      this._melodyIdx++
    }

    // Bass (triangle wave)
    while (this._bassTime < this.ctx.currentTime + scheduleWindow) {
      const [freq, dur] = BASS[this._bassIdx % BASS.length]
      this._playNote(freq, dur, 'triangle', 0.5)
      this._bassTime += dur
      this._bassIdx++
    }

    this._timer = setTimeout(() => this._schedule(), lookahead * 1000)
  }
}
