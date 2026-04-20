# Agent 05 — Affichage AR des animaux

## Rôle
Tu es l'agent de rendu AR. Tu dessines les animaux directement sur le canvas, ancrés sur la position de la main détectée, avec une animation fluide d'apparition et disparition.

## Tâches

### 1. Crée les 4 SVG animaux dans `src/assets/animals/`

**`cat.svg`** :
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Corps -->
  <ellipse cx="100" cy="120" rx="55" ry="50" fill="#FF8C42"/>
  <!-- Tête -->
  <circle cx="100" cy="75" r="45" fill="#FF8C42"/>
  <!-- Oreilles -->
  <polygon points="60,40 45,10 78,35" fill="#FF8C42"/>
  <polygon points="140,40 155,10 122,35" fill="#FF8C42"/>
  <polygon points="63,38 52,18 76,36" fill="#FFB088"/>
  <polygon points="137,38 148,18 124,36" fill="#FFB088"/>
  <!-- Yeux -->
  <ellipse cx="83" cy="72" rx="10" ry="12" fill="#2D5A27"/>
  <ellipse cx="117" cy="72" rx="10" ry="12" fill="#2D5A27"/>
  <ellipse cx="83" cy="73" rx="5" ry="9" fill="#1a1a1a"/>
  <ellipse cx="117" cy="73" rx="5" ry="9" fill="#1a1a1a"/>
  <circle cx="86" cy="69" r="2.5" fill="white"/>
  <circle cx="120" cy="69" r="2.5" fill="white"/>
  <!-- Nez -->
  <ellipse cx="100" cy="83" rx="5" ry="4" fill="#FF6B9D"/>
  <!-- Bouche -->
  <path d="M95 87 Q100 92 105 87" stroke="#333" stroke-width="1.5" fill="none"/>
  <!-- Moustaches -->
  <line x1="60" y1="82" x2="93" y2="84" stroke="#555" stroke-width="1.2"/>
  <line x1="60" y1="87" x2="93" y2="86" stroke="#555" stroke-width="1.2"/>
  <line x1="107" y1="84" x2="140" y2="82" stroke="#555" stroke-width="1.2"/>
  <line x1="107" y1="86" x2="140" y2="87" stroke="#555" stroke-width="1.2"/>
  <!-- Queue -->
  <path d="M155 140 Q180 110 165 90" stroke="#FF8C42" stroke-width="10" stroke-linecap="round" fill="none"/>
</svg>
```

**`dog.svg`** :
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Corps -->
  <ellipse cx="100" cy="125" rx="55" ry="48" fill="#C8894E"/>
  <!-- Tête -->
  <circle cx="100" cy="78" r="44" fill="#C8894E"/>
  <!-- Oreilles tombantes -->
  <ellipse cx="62" cy="75" rx="20" ry="32" fill="#A0673A" transform="rotate(-15 62 75)"/>
  <ellipse cx="138" cy="75" rx="20" ry="32" fill="#A0673A" transform="rotate(15 138 75)"/>
  <!-- Museau -->
  <ellipse cx="100" cy="90" rx="22" ry="18" fill="#E8AA76"/>
  <!-- Yeux -->
  <circle cx="84" cy="72" r="10" fill="#4A2C0A"/>
  <circle cx="116" cy="72" r="10" fill="#4A2C0A"/>
  <circle cx="87" cy="69" r="3" fill="white"/>
  <circle cx="119" cy="69" r="3" fill="white"/>
  <!-- Nez -->
  <ellipse cx="100" cy="84" rx="9" ry="7" fill="#2a1a0a"/>
  <ellipse cx="98" cy="82" rx="3" ry="2" fill="#5a3a2a" opacity="0.5"/>
  <!-- Bouche -->
  <path d="M88 93 Q100 100 112 93" stroke="#8B5E3C" stroke-width="2" fill="none"/>
  <!-- Langue -->
  <ellipse cx="100" cy="99" rx="8" ry="6" fill="#FF6B8A"/>
  <!-- Tache sur l'oeil -->
  <ellipse cx="116" cy="70" rx="14" ry="13" fill="#A0673A" opacity="0.5"/>
</svg>
```

**`koala.svg`** :
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Corps -->
  <ellipse cx="100" cy="128" rx="50" ry="45" fill="#9B9B9B"/>
  <!-- Tête -->
  <circle cx="100" cy="82" r="46" fill="#B8B8B8"/>
  <!-- Grandes oreilles rondes -->
  <circle cx="55" cy="52" r="28" fill="#9B9B9B"/>
  <circle cx="145" cy="52" r="28" fill="#9B9B9B"/>
  <circle cx="55" cy="52" r="18" fill="#D4C5C0"/>
  <circle cx="145" cy="52" r="18" fill="#D4C5C0"/>
  <!-- Yeux -->
  <circle cx="84" cy="80" r="11" fill="#2a2a2a"/>
  <circle cx="116" cy="80" r="11" fill="#2a2a2a"/>
  <circle cx="87" cy="77" r="3.5" fill="white"/>
  <circle cx="119" cy="77" r="3.5" fill="white"/>
  <!-- Nez grand et noir -->
  <ellipse cx="100" cy="92" rx="14" ry="11" fill="#1a1a1a"/>
  <ellipse cx="97" cy="90" rx="4" ry="3" fill="#3a3a3a" opacity="0.4"/>
  <!-- Bouche -->
  <path d="M91 100 Q100 106 109 100" stroke="#666" stroke-width="1.5" fill="none"/>
  <!-- Ventre clair -->
  <ellipse cx="100" cy="135" rx="32" ry="30" fill="#D4C5C0"/>
</svg>
```

**`panda.svg`** :
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Corps blanc -->
  <ellipse cx="100" cy="128" rx="52" ry="46" fill="#f5f5f5"/>
  <!-- Tête blanche -->
  <circle cx="100" cy="80" r="46" fill="#f5f5f5"/>
  <!-- Oreilles noires -->
  <circle cx="60" cy="44" r="22" fill="#1a1a1a"/>
  <circle cx="140" cy="44" r="22" fill="#1a1a1a"/>
  <!-- Cernes noirs autour des yeux -->
  <ellipse cx="82" cy="76" rx="17" ry="15" fill="#1a1a1a" transform="rotate(-15 82 76)"/>
  <ellipse cx="118" cy="76" rx="17" ry="15" fill="#1a1a1a" transform="rotate(15 118 76)"/>
  <!-- Yeux -->
  <circle cx="82" cy="76" r="9" fill="white"/>
  <circle cx="118" cy="76" r="9" fill="white"/>
  <circle cx="82" cy="77" r="5" fill="#1a1a1a"/>
  <circle cx="118" cy="77" r="5" fill="#1a1a1a"/>
  <circle cx="84" cy="75" r="2" fill="white"/>
  <circle cx="120" cy="75" r="2" fill="white"/>
  <!-- Nez -->
  <ellipse cx="100" cy="90" rx="8" ry="6" fill="#1a1a1a"/>
  <!-- Bouche -->
  <path d="M93 95 Q100 101 107 95" stroke="#555" stroke-width="1.5" fill="none"/>
  <!-- Taches noires du corps -->
  <ellipse cx="60" cy="118" rx="20" ry="25" fill="#1a1a1a" opacity="0.85"/>
  <ellipse cx="140" cy="118" rx="20" ry="25" fill="#1a1a1a" opacity="0.85"/>
</svg>
```

### 2. Met à jour `src/ar/renderer.js` pour afficher les animaux sur le canvas :
Remplace complètement `renderer.js` par :

```js
export class ARRenderer {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')
    this.video = videoElement
    this.animalImages = {}
    this.activeAnimal = null   // { image, x, y, alpha, scale, startTime }
    this.animDuration = 600    // ms pour l'animation d'entrée
    this.displayDuration = 3000 // ms d'affichage
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
          // Easing entrée (0 → 1 en animDuration ms)
          const tIn = Math.min(elapsed / this.animDuration, 1)
          const easeIn = 1 - Math.pow(1 - tIn, 3) // ease-out cubic

          // Easing sortie (fade out à partir de displayDuration)
          let alphaOut = 1
          if (elapsed > this.displayDuration) {
            alphaOut = 1 - (elapsed - this.displayDuration) / this.animDuration
          }

          a.alpha = easeIn * alphaOut
          a.scale = easeIn * 1.1 - (easeIn > 0.8 ? (easeIn - 0.8) * 0.5 : 0) // léger bounce

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
```

### 3. Met à jour `src/main.js` pour connecter le renderer AR au combo :
Dans la fonction `onCombo`, ajoute l'appel au renderer :

```js
onCombo: (result) => {
  const wrist = renderer.getWristPosition(lastLandmarks)
  renderer.showAnimal(result.animal, wrist)
  showAnimal(result)
}
```

Ajoute `let lastLandmarks = null` en haut et `lastLandmarks = landmarks` dans `onResults`.

## Validation
- [ ] Les 4 SVG s'affichent correctement dans le navigateur via `<img>`
- [ ] L'animal apparaît AU-DESSUS de la main lors d'un combo
- [ ] Animation scale + fade-in smooth (600ms)
- [ ] Disparition propre après 3 secondes
- [ ] Les landmarks restent visibles sous l'animal

## Output attendu
Démo visuelle : combo ✊+✌️ → chat apparaît au-dessus du poignet avec animation.
