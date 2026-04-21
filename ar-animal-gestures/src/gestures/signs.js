function isFingerUp(lm, tip, mcp) {
  return lm[tip].y < lm[mcp].y - 0.04
}

function isThumbUp(lm) {
  const dx = Math.abs(lm[4].x - lm[2].x)
  const dy = Math.abs(lm[4].y - lm[2].y)
  return dx > 0.06 || dy > 0.06
}

export function classifySign(landmarks) {
  if (!landmarks || landmarks.length < 21) return null

  const lm = landmarks

  const thumb = isThumbUp(lm)
  const index = isFingerUp(lm, 8, 5)
  const middle = isFingerUp(lm, 12, 9)
  const ring = isFingerUp(lm, 16, 13)
  const pinky = isFingerUp(lm, 20, 17)

  if (!index && !middle && !ring && !pinky) {
    return { sign: 'fist', label: '✊', confidence: 0.9 }
  }

  if (index && middle && !ring && !pinky) {
    return { sign: 'peace', label: '✌️', confidence: 0.9 }
  }

  if (index && middle && ring && pinky) {
    return { sign: 'open', label: '🖐', confidence: 0.85 }
  }

  if (index && !middle && !ring && !pinky) {
    return { sign: 'point', label: '☝️', confidence: 0.88 }
  }

  return null
}

export class SignSmoother {
  constructor(requiredFrames = 6) {
    this.buffer = []
    this.requiredFrames = requiredFrames
    this.lastStableSign = null
  }

  update(signResult) {
    if (!signResult) {
      this.buffer = []
      return null
    }

    this.buffer.push(signResult.sign)
    if (this.buffer.length > this.requiredFrames) {
      this.buffer.shift()
    }

    if (this.buffer.length >= this.requiredFrames) {
      const allSame = this.buffer.every(s => s === this.buffer[0])
      if (allSame) {
        const stable = signResult
        if (stable.sign !== this.lastStableSign) {
          this.lastStableSign = stable.sign
          return stable
        }
      }
    }

    return null
  }

  reset() {
    this.buffer = []
    this.lastStableSign = null
  }
}
