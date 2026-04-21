// Finger indices: tip, pip, mcp
const FINGERS = [
  [8,  7,  5],  // index
  [12, 11, 9],  // middle
  [16, 15, 13], // ring
  [20, 19, 17], // pinky
]

// Extended: tip clearly above PIP (not just MCP) — handles tilted hands better
function isExtended(lm, [tip, pip]) {
  return lm[tip].y < lm[pip].y - 0.015
}

// Curled: tip is below or at MCP level
function isCurled(lm, [tip, , mcp]) {
  return lm[tip].y > lm[mcp].y - 0.02
}

// Thumb: extended sideways — compare tip to base (landmark 2), use x distance
function isThumbExtended(lm) {
  const dx = Math.abs(lm[4].x - lm[3].x)
  const dy = Math.abs(lm[4].y - lm[3].y)
  return dx > 0.04 || dy > 0.04
}

export function classifySign(landmarks) {
  if (!landmarks || landmarks.length < 21) return null
  const lm = landmarks

  const ext  = FINGERS.map(f => isExtended(lm, f))
  const curl = FINGERS.map(f => isCurled(lm, f))
  // ext/curl[0]=index, [1]=middle, [2]=ring, [3]=pinky

  // Fist ✊ — all four fingers curled
  if (curl[0] && curl[1] && curl[2] && curl[3]) {
    return { sign: 'fist', label: '✊' }
  }

  // Peace ✌️ — index + middle up, ring + pinky curled
  if (ext[0] && ext[1] && curl[2] && curl[3]) {
    return { sign: 'peace', label: '✌️' }
  }

  // Open 🖐 — all four fingers extended
  if (ext[0] && ext[1] && ext[2] && ext[3]) {
    return { sign: 'open', label: '🖐' }
  }

  // Point ☝️ — only index extended, rest curled
  if (ext[0] && curl[1] && curl[2] && curl[3]) {
    return { sign: 'point', label: '☝️' }
  }

  return null
}

export class SignSmoother {
  constructor(requiredFrames = 6) {
    this.requiredFrames = requiredFrames
    this.buffer = []
    this.lastStableSign = null
  }

  update(signResult) {
    if (!signResult) {
      this.buffer = []
      return null
    }

    this.buffer.push(signResult.sign)
    if (this.buffer.length > this.requiredFrames) this.buffer.shift()

    if (this.buffer.length >= this.requiredFrames) {
      // Majority vote: 80% of frames must agree
      const counts = {}
      this.buffer.forEach(s => { counts[s] = (counts[s] || 0) + 1 })
      const [topSign, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

      if (topCount >= Math.ceil(this.requiredFrames * 0.8)) {
        if (topSign !== this.lastStableSign) {
          this.lastStableSign = topSign
          return { sign: topSign, label: signResult.label }
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
