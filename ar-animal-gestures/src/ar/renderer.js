export class ARRenderer {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')
    this.video = videoElement
    this.pendingLandmarks = []
    this._animLoop()
  }

  resize() {
    this.canvas.width = this.video.videoWidth || 640
    this.canvas.height = this.video.videoHeight || 480
  }

  // Call once per frame with all detected hands
  drawLandmarks(landmarks) {
    this.pendingLandmarks.push(landmarks)
  }

  _drawHand(landmarks) {
    if (!landmarks) return
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    const pts = landmarks.map(lm => ({ x: lm.x * w, y: lm.y * h }))

    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17]
    ]

    ctx.strokeStyle = 'rgba(0, 255, 170, 0.6)'
    ctx.lineWidth = 1.5
    connections.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(pts[a].x, pts[a].y)
      ctx.lineTo(pts[b].x, pts[b].y)
      ctx.stroke()
    })

    pts.forEach((pt, i) => {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, i === 0 ? 5 : 3, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? '#ff4444' : 'rgba(0,255,170,0.8)'
      ctx.fill()
    })
  }

  _animLoop() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      // Draw all hands queued this frame, then clear for next frame
      this.pendingLandmarks.forEach(lm => this._drawHand(lm))
      this.pendingLandmarks = []
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}
