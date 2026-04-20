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
      'fist+fist':    { animal: 'cat',   emoji: '🐱', label: 'Chat',  description: 'Double poing' },
      'fist+peace':   { animal: 'cat',   emoji: '🐱', label: 'Chat',  description: 'Poing puis V' },
      'peace+peace':  { animal: 'dog',   emoji: '🐶', label: 'Chien', description: 'Double V' },
      'peace+point':  { animal: 'dog',   emoji: '🐶', label: 'Chien', description: 'V puis index' },
      'open+open':    { animal: 'koala', emoji: '🐨', label: 'Koala', description: 'Double main ouverte' },
      'open+fist':    { animal: 'koala', emoji: '🐨', label: 'Koala', description: 'Main ouverte puis poing' },
      'point+point':  { animal: 'panda', emoji: '🐼', label: 'Panda', description: 'Double index' },
      'point+open':   { animal: 'panda', emoji: '🐼', label: 'Panda', description: 'Index puis main ouverte' },
      'fist+open':    { animal: 'panda', emoji: '🐼', label: 'Panda', description: 'Poing + main ouverte' },
      'point+peace':  { animal: 'koala', emoji: '🐨', label: 'Koala', description: 'Index + V' },
    }

    return combos[key] || null
  }

  reset() {
    clearTimeout(this.resetTimer)
    this.buffer = []
    this.onUpdate?.([])
  }
}
