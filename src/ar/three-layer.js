import * as THREE from 'three'

function makeCrownTexture(size = 200) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.font = `${Math.floor(size * 0.78)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('👑', size / 2, size / 2)
  return new THREE.CanvasTexture(c)
}

export class ThreeARLayer {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement
    this.video  = videoElement

    this.scene    = new THREE.Scene()
    this.camera   = null
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasElement, alpha: true, antialias: true })
    this.renderer.setClearColor(0x000000, 0)

    const mat = new THREE.SpriteMaterial({ map: makeCrownTexture(200), transparent: true, depthWrite: false })
    this._crown = new THREE.Sprite(mat)
    this._crown.scale.set(150, 150, 1)
    this._crown.visible = false
    this.scene.add(this._crown)

    this._target = null   // {x, y} in video normalized coords, or null
    this._clock = new THREE.Clock()
    this._animLoop()
  }

  resize() {
    const w = this.video.videoWidth  || 640
    const h = this.video.videoHeight || 480
    if (this.canvas.width === w && this.canvas.height === h) return
    this.canvas.width  = w
    this.canvas.height = h
    this.renderer.setSize(w, h, false)
    this.camera = new THREE.OrthographicCamera(0, w, h, 0, -100, 100)
    this.camera.position.z = 10
  }

  // x, y: normalized (0-1) video coords of crown anchor, or null to hide
  setCrown(x, y) {
    this._target = (x != null && y != null) ? { x, y } : null
  }

  _animLoop() {
    const loop = () => {
      const t = this._clock.getElapsedTime()
      const w = this.canvas.width
      const h = this.canvas.height

      if (!this._target) {
        this._crown.visible = false
      } else {
        this._crown.visible = true
        const px = this._target.x * w
        const py = (1 - this._target.y) * h
        this._crown.position.set(px, py + 10 + Math.sin(t * 3) * 6, 0)
      }

      if (this.camera) this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}
