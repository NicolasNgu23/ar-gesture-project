# Agent 02 — Intégration MediaPipe Hands

## Rôle
Tu es l'agent d'intégration de la détection de mains. Tu connectes la webcam à MediaPipe Hands et tu dessines les landmarks sur le canvas overlay.

## Tâches

### 1. Ajoute MediaPipe via CDN dans `index.html`
Ajoute ces scripts dans le `<head>` avant le CSS :
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
```

### 2. Crée `src/gestures/detector.js` :
```js
// Wrapper MediaPipe Hands
export class HandDetector {
  constructor({ onResults }) {
    this.onResults = onResults
    this.hands = null
    this.camera = null
  }

  async init(videoElement) {
    this.hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.6
    })

    this.hands.onResults((results) => {
      this.onResults(results)
    })

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement })
      },
      width: 640,
      height: 480
    })

    await this.camera.start()
    console.log('[HandDetector] Caméra démarrée')
  }

  stop() {
    this.camera?.stop()
  }
}
```

### 3. Crée `src/ar/renderer.js` (version initiale — landmarks seulement) :
```js
export class ARRenderer {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')
    this.video = videoElement
    this.currentAnimal = null
    this.animalAlpha = 0
    this.animalImages = {}
  }

  resize() {
    this.canvas.width = this.video.videoWidth || 640
    this.canvas.height = this.video.videoHeight || 480
  }

  drawLandmarks(landmarks) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (!landmarks || landmarks.length === 0) return

    const pts = landmarks.map(lm => ({
      x: lm.x * this.canvas.width,
      y: lm.y * this.canvas.height
    }))

    // Connexions de base (poignet → doigts)
    const connections = [
      [0,1],[1,2],[2,3],[3,4],   // pouce
      [0,5],[5,6],[6,7],[7,8],   // index
      [0,9],[9,10],[10,11],[11,12], // majeur
      [0,13],[13,14],[14,15],[15,16], // annulaire
      [0,17],[17,18],[18,19],[19,20], // auriculaire
      [5,9],[9,13],[13,17]        // paume
    ]

    ctx.strokeStyle = 'rgba(0, 255, 170, 0.7)'
    ctx.lineWidth = 2
    connections.forEach(([a, b]) => {
      ctx.beginPath()
      ctx.moveTo(pts[a].x, pts[a].y)
      ctx.lineTo(pts[b].x, pts[b].y)
      ctx.stroke()
    })

    // Points landmarks
    pts.forEach((pt, i) => {
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, i === 0 ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? '#ff4444' : '#00ffaa'
      ctx.fill()
    })
  }

  getWristPosition(landmarks) {
    if (!landmarks || !landmarks[0]) return null
    return {
      x: landmarks[0].x * this.canvas.width,
      y: landmarks[0].y * this.canvas.height
    }
  }
}
```

### 4. Crée `src/main.js` (version initiale) :
```js
import { HandDetector } from './gestures/detector.js'
import { ARRenderer } from './ar/renderer.js'

const video = document.getElementById('webcam')
const canvas = document.getElementById('overlay')
const signDisplay = document.getElementById('sign-display')

const renderer = new ARRenderer(canvas, video)

const detector = new HandDetector({
  onResults: (results) => {
    renderer.resize()
    const landmarks = results.multiHandLandmarks?.[0]
    renderer.drawLandmarks(landmarks)

    if (landmarks) {
      signDisplay.textContent = '✋ Main détectée — en attente du signe...'
    } else {
      signDisplay.textContent = 'En attente d\'un signe...'
    }
  }
})

video.addEventListener('loadedmetadata', () => renderer.resize())

detector.init(video).catch(err => {
  console.error('Erreur caméra:', err)
  signDisplay.textContent = '❌ Accès webcam refusé — vérifie les permissions'
})
```

### 5. Ajoute dans `src/style.css` les styles de base :
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0a0a0a;
  font-family: system-ui, sans-serif;
  color: #fff;
  overflow: hidden;
}

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#camera-container {
  position: relative;
  width: 640px;
  height: 480px;
}

#webcam {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* miroir */
  border-radius: 12px;
}

#overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  transform: scaleX(-1); /* miroir aussi */
  pointer-events: none;
  border-radius: 12px;
}

#ui-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

#sign-display {
  background: rgba(0,0,0,0.6);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 16px;
  backdrop-filter: blur(8px);
}

#combo-display {
  margin-top: 8px;
  font-size: 24px;
  min-height: 32px;
  letter-spacing: 4px;
}

#animal-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 120px;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.5));
}

#animal-popup.visible {
  transform: translate(-50%, -50%) scale(1);
}

#animal-popup.hidden {
  display: none;
}

#guide-panel {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.7);
  padding: 16px 20px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  font-size: 14px;
  min-width: 180px;
}

#guide-panel h3 {
  margin-bottom: 10px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #aaa;
}

#guide-panel li {
  list-style: none;
  margin-bottom: 6px;
}

.tip {
  margin-top: 12px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}
```

## Validation
- [ ] La webcam s'ouvre correctement
- [ ] Les landmarks verts apparaissent sur la main en temps réel
- [ ] Le point rouge au poignet est visible
- [ ] Aucune erreur dans la console (sauf CORS ignorable depuis MediaPipe CDN)
- [ ] Le miroir (`scaleX(-1)`) fonctionne et l'image est logique

## Output attendu
Confirme que les landmarks s'affichent sur la main en live.
