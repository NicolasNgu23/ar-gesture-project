export class ARRenderer {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')
    this.video = videoElement
    this.animalImages = {}
    this.activeAnimal = null
    this.animDuration = 600
    this.displayDuration = 3000
    this.currentLandmarks = null
    this._loadAnimals()
    this._animLoop()
  }

  async _loadAnimals() {
    const animals = ['cat', 'dog', 'koala', 'panda']
    for (const name of animals) {
      const img = new Image()
      img.src = `/src/assets/animals/${name}.svg`
      await new Promise(res => { img.onload = res; img.onerror = res })
      this.animalImages[name] = img
    }
    console.log('[ARRenderer] Assets chargés')
  }

  resize() {
    this.canvas.width = this.video.videoWidth || 640
    this.canvas.height = this.video.videoHeight || 480
  }

  showAnimal(animalKey, wristPosition) {
    const img = this.animalImages[animalKey]
    if (!img) return

    const x = wristPosition ? wristPosition.x : this.canvas.width / 2
    const y = wristPosition ? wristPosition.y - 80 : this.canvas.height / 2

    this.activeAnimal = {
      key: animalKey,
      image: img,
      x,
      y,
      alpha: 0,
      scale: 0,
      startTime: Date.now()
    }
  }

  drawLandmarks(landmarks) {
    this.currentLandmarks = landmarks
  }

  _drawLandmarksInternal(landmarks) {
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
      this._drawLandmarksInternal(this.currentLandmarks)

      if (this.activeAnimal) {
        const a = this.activeAnimal
        const elapsed = Date.now() - a.startTime
        const totalDuration = this.displayDuration + this.animDuration

        if (elapsed > totalDuration) {
          this.activeAnimal = null
        } else {
          const tIn = Math.min(elapsed / this.animDuration, 1)
          const easeIn = 1 - Math.pow(1 - tIn, 3)

          let alphaOut = 1
          if (elapsed > this.displayDuration) {
            alphaOut = 1 - (elapsed - this.displayDuration) / this.animDuration
          }

          a.alpha = easeIn * alphaOut
          a.scale = easeIn * 1.1 - (easeIn > 0.8 ? (easeIn - 0.8) * 0.5 : 0)

          this.ctx.save()
          this.ctx.globalAlpha = Math.max(0, a.alpha)
          const size = 120 * a.scale
          this.ctx.drawImage(a.image, a.x - size / 2, a.y - size / 2, size, size)
          this.ctx.restore()
        }
      }

      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }

  getWristPosition(landmarks) {
    if (!landmarks?.[0]) return null
    return {
      x: landmarks[0].x * this.canvas.width,
      y: landmarks[0].y * this.canvas.height
    }
  }
}
