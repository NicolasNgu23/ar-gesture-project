const SIGNS = ['fist', 'peace', 'open', 'point']

export const SIGN_LABELS = { fist: '✊', peace: '✌️', open: '🖐', point: '☝️' }

export class RaceLane {
  constructor({ totalSigns = 20, sequenceVisible = 5 } = {}) {
    this.totalSigns = totalSigns
    this.sequenceVisible = sequenceVisible
    this.sequence = this._generate(totalSigns + sequenceVisible + 10)
    this.currentIndex = 0
    this.startTime = null
    this.endTime = null
    this.finished = false
    this.missStreak = 0
  }

  _generate(length) {
    const result = []
    for (let i = 0; i < length; i++) {
      let sign
      do {
        sign = SIGNS[Math.floor(Math.random() * SIGNS.length)]
      } while (result.length > 0 && result[result.length - 1] === sign)
      result.push(sign)
    }
    return result
  }

  get currentSign() {
    return this.sequence[Math.max(0, this.currentIndex)]
  }

  get upcomingSigns() {
    const idx = Math.max(0, this.currentIndex)
    return this.sequence.slice(idx, idx + this.sequenceVisible)
  }

  get progress() {
    return Math.min(Math.max(this.currentIndex, 0) / this.totalSigns, 1)
  }

  get elapsed() {
    if (!this.startTime) return 0
    return (this.endTime || Date.now()) - this.startTime
  }

  checkSign(sign) {
    if (this.finished) return { correct: false, penalty: false }

    if (sign !== this.currentSign) {
      this.missStreak++
      const penalty = this.missStreak >= 3
      if (penalty) {
        this.currentIndex = Math.max(0, this.currentIndex - 2)
        this.missStreak = 0
      }
      return { correct: false, penalty }
    }

    if (!this.startTime) this.startTime = Date.now()
    this.missStreak = 0
    this.currentIndex++

    if (this.currentIndex >= this.totalSigns) {
      this.finished = true
      this.endTime = Date.now()
    }

    return { correct: true, penalty: false }
  }

  reset() {
    this.sequence = this._generate(this.totalSigns + this.sequenceVisible + 10)
    this.currentIndex = 0
    this.startTime = null
    this.endTime = null
    this.finished = false
    this.missStreak = 0
  }
}

export function formatTime(ms) {
  const total = Math.floor(ms / 100)
  const deciseconds = total % 10
  const seconds = Math.floor(total / 10) % 60
  const minutes = Math.floor(total / 600)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${deciseconds}`
}
