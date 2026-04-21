export class ComboBuffer {
  constructor({ maxDelay = 2000, sequenceLength = 2, onCombo, onUpdate }) {
    this.maxDelay = maxDelay
    this.sequenceLength = sequenceLength
    this.onCombo = onCombo
    this.onUpdate = onUpdate
    this.buffer = []
    this.resetTimer = null
  }

  push(signResult) {
    const now = Date.now()

    if (this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1]
      if (last.sign === signResult.sign) return
    }

    if (this.buffer.length > 0) {
      const lastTime = this.buffer[this.buffer.length - 1].timestamp
      if (now - lastTime > this.maxDelay) {
        this.buffer = []
      }
    }

    this.buffer.push({ ...signResult, timestamp: now })
    this.onUpdate?.(this.buffer)

    clearTimeout(this.resetTimer)
    this.resetTimer = setTimeout(() => {
      this.buffer = []
      this.onUpdate?.([])
    }, this.maxDelay)

    if (this.buffer.length >= this.sequenceLength) {
      this._checkCombo()
    }
  }

  _checkCombo() {
    const seq = this.buffer.slice(-this.sequenceLength)
    const combo = this._matchCombo(seq)

    if (combo) {
      clearTimeout(this.resetTimer)
      this.onCombo?.(combo)
      this.buffer = []
      this.onUpdate?.([])
    }
  }

  _matchCombo(seq) {
    const key = seq.map(s => s.sign).join('+')

    const combos = {
      'fist+fist':   { key: 'fist+fist',   description: 'Double poing' },
      'fist+peace':  { key: 'fist+peace',  description: 'Poing puis V' },
      'peace+peace': { key: 'peace+peace', description: 'Double V' },
      'peace+point': { key: 'peace+point', description: 'V puis index' },
      'open+open':   { key: 'open+open',   description: 'Double main ouverte' },
      'open+fist':   { key: 'open+fist',   description: 'Main ouverte puis poing' },
      'point+point': { key: 'point+point', description: 'Double index' },
      'point+open':  { key: 'point+open',  description: 'Index puis main ouverte' },
      'fist+open':   { key: 'fist+open',   description: 'Poing + main ouverte' },
      'point+peace': { key: 'point+peace', description: 'Index + V' },
    }

    return combos[key] || null
  }

  reset() {
    clearTimeout(this.resetTimer)
    this.buffer = []
    this.onUpdate?.([])
  }
}
