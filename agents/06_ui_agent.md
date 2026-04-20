# Agent 06 — UI/UX finale et polish

## Rôle
Tu es l'agent de finition. Tu peaufines l'interface, ajoutes des feedbacks visuels, et rends l'expérience fluide et plaisante.

## Tâches

### 1. Refonte complète de `src/style.css`
Remplace tout le CSS par cette version finale :

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --accent: #00ffaa;
  --accent2: #7c3aed;
  --bg: #0c0c10;
  --panel-bg: rgba(10, 10, 16, 0.75);
  --text: #f0f0f0;
  --text-muted: #888;
  --radius: 14px;
}

body {
  background: var(--bg);
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text);
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Caméra ──────────────────────────────────────────── */
#camera-container {
  position: relative;
  width: min(640px, 90vw);
  aspect-ratio: 4/3;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.07), 0 20px 60px rgba(0,0,0,0.6);
}

#webcam {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  display: block;
}

#overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
}

/* ── Barre de statut (bas) ───────────────────────────── */
#status-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

#sign-display {
  background: var(--panel-bg);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 8px 22px;
  border-radius: 24px;
  font-size: 14px;
  backdrop-filter: blur(12px);
  white-space: nowrap;
  transition: background 0.3s;
}

#sign-display.detected {
  background: rgba(0, 255, 170, 0.12);
  border-color: rgba(0, 255, 170, 0.3);
}

#combo-display {
  font-size: 28px;
  letter-spacing: 6px;
  min-height: 36px;
  text-align: center;
  filter: drop-shadow(0 0 8px rgba(0,255,170,0.5));
  transition: opacity 0.2s;
}

/* ── Panel guide (droite) ────────────────────────────── */
#guide-panel {
  position: absolute;
  right: -200px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--panel-bg);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 18px 20px;
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
  font-size: 13px;
  width: 185px;
  transition: right 0.3s ease;
}

#app:hover #guide-panel {
  right: 16px;
}

#guide-panel h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.sign-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sign-item:last-of-type { border-bottom: none; }

.sign-emoji { font-size: 20px; }

.sign-info {
  display: flex;
  flex-direction: column;
}

.sign-name { font-weight: 500; font-size: 13px; }
.sign-animal { font-size: 11px; color: var(--text-muted); }

.tip {
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.6;
  background: rgba(124, 58, 237, 0.1);
  border-left: 2px solid var(--accent2);
  padding: 6px 8px;
  border-radius: 0 6px 6px 0;
}

/* ── Popup animal (overlay centré) ───────────────────── */
#animal-popup {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  text-align: center;
}

#animal-popup.visible {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

#animal-popup-emoji {
  font-size: 96px;
  display: block;
  filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));
}

#animal-popup-label {
  font-size: 22px;
  font-weight: 600;
  margin-top: 6px;
  color: white;
  text-shadow: 0 0 20px rgba(0,0,0,0.8);
}

/* ── Indicateur de connexion webcam ─────────────────── */
#cam-status {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--panel-bg);
  padding: 5px 14px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.07);
}

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #555;
  transition: background 0.3s;
}

.dot.active { background: var(--accent); box-shadow: 0 0 6px var(--accent); }

/* ── Particules de combo (effet visuel) ─────────────── */
@keyframes particle-burst {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

.particle {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: particle-burst 0.6s ease-out forwards;
  pointer-events: none;
}

/* ── Responsive mobile ───────────────────────────────── */
@media (max-width: 700px) {
  #guide-panel { display: none; }
  #camera-container { width: 100vw; border-radius: 0; }
}
```

### 2. Met à jour `index.html` avec la nouvelle structure UI :
Remplace le `<body>` content par :

```html
<div id="app">
  <div id="camera-container">
    <video id="webcam" autoplay playsinline muted></video>
    <canvas id="overlay"></canvas>

    <!-- Popup animal centré sur le flux -->
    <div id="animal-popup">
      <span id="animal-popup-emoji"></span>
      <div id="animal-popup-label"></div>
    </div>
  </div>

  <!-- Barre statut bas -->
  <div id="status-bar">
    <div id="sign-display">Initialisation...</div>
    <div id="combo-display"></div>
  </div>

  <!-- Indicateur webcam -->
  <div id="cam-status">
    <span class="dot" id="cam-dot"></span>
    <span id="cam-label">Connexion webcam...</span>
  </div>

  <!-- Panel guide (slide depuis la droite au hover) -->
  <div id="guide-panel">
    <h3>Signes disponibles</h3>
    <div class="sign-item">
      <span class="sign-emoji">✊</span>
      <div class="sign-info"><span class="sign-name">Poing</span><span class="sign-animal">→ 🐱 Chat</span></div>
    </div>
    <div class="sign-item">
      <span class="sign-emoji">✌️</span>
      <div class="sign-info"><span class="sign-name">V</span><span class="sign-animal">→ 🐶 Chien</span></div>
    </div>
    <div class="sign-item">
      <span class="sign-emoji">🖐</span>
      <div class="sign-info"><span class="sign-name">Main ouverte</span><span class="sign-animal">→ 🐨 Koala</span></div>
    </div>
    <div class="sign-item">
      <span class="sign-emoji">☝️</span>
      <div class="sign-info"><span class="sign-name">Index</span><span class="sign-animal">→ 🐼 Panda</span></div>
    </div>
    <p class="tip">Enchaîne 2 signes en moins de 2 secondes pour invoquer un animal !</p>
  </div>
</div>
```

### 3. Ajoute dans `src/main.js` la gestion des nouveaux éléments UI :
Ajoute en haut, après les imports :
```js
const camDot = document.getElementById('cam-dot')
const camLabel = document.getElementById('cam-label')
const animalPopupEmoji = document.getElementById('animal-popup-emoji')
const animalPopupLabel = document.getElementById('animal-popup-label')
```

Remplace la fonction `showAnimal` par :
```js
function showAnimal(result) {
  const popup = document.getElementById('animal-popup')
  animalPopupEmoji.textContent = result.emoji
  animalPopupLabel.textContent = result.label

  popup.classList.remove('hidden')
  requestAnimationFrame(() => popup.classList.add('visible'))

  // Particules burst
  spawnParticles(result.emoji)

  setTimeout(() => {
    popup.classList.remove('visible')
  }, 3000)

  signDisplay.textContent = `🎉 ${result.emoji} ${result.label} !`
}

function spawnParticles(emoji) {
  const container = document.getElementById('camera-container')
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    const angle = (i / 8) * 360
    const dist = 60 + Math.random() * 40
    p.style.cssText = `
      left: 50%; top: 40%;
      --tx: ${Math.cos(angle * Math.PI/180) * dist}px;
      --ty: ${Math.sin(angle * Math.PI/180) * dist}px;
      background: hsl(${angle}, 80%, 65%);
      animation-delay: ${i * 30}ms;
    `
    container.appendChild(p)
    setTimeout(() => p.remove(), 800)
  }
}
```

Ajoute le feedback dans `onResults` quand la webcam est connectée :
```js
// Dans onResults, première frame
if (!window._camReady) {
  window._camReady = true
  camDot.classList.add('active')
  camLabel.textContent = 'Webcam active'
}
```

## Validation
- [ ] Le guide panel slide depuis la droite au hover
- [ ] Les particules s'explosent lors d'un combo réussi
- [ ] L'indicateur webcam passe au vert au démarrage
- [ ] L'interface est lisible sur mobile (guide panel masqué)
- [ ] Aucun saccade ou layout shift visible

## Output attendu
L'interface finale est fluide, dark, et les animations de combo sont satisfaisantes visuellement.
