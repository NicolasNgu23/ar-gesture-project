# Agent 03 — Reconnaissance des signes gestuels

## Rôle
Tu es l'agent de reconnaissance. Tu analyses les 21 landmarks MediaPipe pour classifier 4 signes de main distincts en temps réel.

## Contexte landmarks
MediaPipe renvoie 21 points normalisés (x, y, z) par main :
- 0 = poignet
- 4 = bout du pouce
- 8 = bout de l'index
- 12 = bout du majeur
- 16 = bout de l'annulaire
- 20 = bout de l'auriculaire
- 5,9,13,17 = articulations MCP (base des doigts)

## Tâches

### 1. Crée `src/gestures/signs.js` — la logique complète de classification :

```js
/**
 * Détermine si un doigt est levé (étendu)
 * Compare la pointe du doigt avec son articulation MCP (base)
 * @param {Array} lm - landmarks normalisés
 * @param {number} tip - index de la pointe
 * @param {number} mcp - index de l'articulation MCP
 * @returns {boolean}
 */
function isFingerUp(lm, tip, mcp) {
  // En coordonnées normalisées, Y augmente vers le bas
  // Un doigt est levé si sa pointe est AU-DESSUS de sa base (y plus petit)
  return lm[tip].y < lm[mcp].y - 0.04
}

/**
 * Détermine si le pouce est étendu (logique différente — axe X)
 * @param {Array} lm
 * @returns {boolean}
 */
function isThumbUp(lm) {
  // Le pouce s'étend latéralement
  // On compare la pointe (4) avec la base (2)
  const dx = Math.abs(lm[4].x - lm[2].x)
  const dy = Math.abs(lm[4].y - lm[2].y)
  return dx > 0.06 || dy > 0.06
}

/**
 * Calcule la distance normalisée entre deux landmarks
 */
function dist(lm, a, b) {
  const dx = lm[a].x - lm[b].x
  const dy = lm[a].y - lm[b].y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Classifie le signe actuel à partir des landmarks
 * @param {Array} landmarks - 21 points MediaPipe
 * @returns {{ sign: string, confidence: number } | null}
 */
export function classifySign(landmarks) {
  if (!landmarks || landmarks.length < 21) return null

  const lm = landmarks

  // État de chaque doigt (levé = true)
  const thumb = isThumbUp(lm)
  const index = isFingerUp(lm, 8, 5)
  const middle = isFingerUp(lm, 12, 9)
  const ring = isFingerUp(lm, 16, 13)
  const pinky = isFingerUp(lm, 20, 17)

  const fingers = [thumb, index, middle, ring, pinky]
  const countUp = fingers.filter(Boolean).length

  // ─── SIGNE 1 : POING ✊ → Chat 🐱 ───────────────────────────────
  // Tous les doigts fermés
  if (!index && !middle && !ring && !pinky) {
    return { sign: 'fist', label: '✊', animal: 'cat', confidence: 0.9 }
  }

  // ─── SIGNE 2 : V ✌️ → Chien 🐶 ──────────────────────────────────
  // Index ET majeur levés, les autres fermés
  if (index && middle && !ring && !pinky) {
    return { sign: 'peace', label: '✌️', animal: 'dog', confidence: 0.9 }
  }

  // ─── SIGNE 3 : MAIN OUVERTE 🖐 → Koala 🐨 ──────────────────────
  // 4 doigts levés minimum (pouce optionnel)
  if (index && middle && ring && pinky) {
    return { sign: 'open', label: '🖐', animal: 'koala', confidence: 0.85 }
  }

  // ─── SIGNE 4 : INDEX LEVÉ ☝️ → Panda 🐼 ─────────────────────────
  // Seulement l'index levé
  if (index && !middle && !ring && !pinky) {
    return { sign: 'point', label: '☝️', animal: 'panda', confidence: 0.88 }
  }

  return null
}

/**
 * Lissage temporel pour éviter les faux positifs
 * Retourne le signe seulement s'il est stable sur N frames
 */
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

    // Signe stable si toutes les frames récentes sont identiques
    if (this.buffer.length >= this.requiredFrames) {
      const allSame = this.buffer.every(s => s === this.buffer[0])
      if (allSame) {
        const stable = signResult
        if (stable.sign !== this.lastStableSign) {
          this.lastStableSign = stable.sign
          return stable // Nouveau signe stable détecté !
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

// Mapping animal → emoji pour l'affichage
export const ANIMAL_EMOJI = {
  cat: '🐱',
  dog: '🐶',
  koala: '🐨',
  panda: '🐼'
}

export const ANIMAL_LABEL = {
  cat: 'Chat',
  dog: 'Chien',
  koala: 'Koala',
  panda: 'Panda'
}
```

### 2. Met à jour `src/main.js` pour intégrer la classification :
Remplace le contenu de `main.js` par :

```js
import { HandDetector } from './gestures/detector.js'
import { ARRenderer } from './ar/renderer.js'
import { classifySign, SignSmoother, ANIMAL_EMOJI, ANIMAL_LABEL } from './gestures/signs.js'

const video = document.getElementById('webcam')
const canvas = document.getElementById('overlay')
const signDisplay = document.getElementById('sign-display')
const comboDisplay = document.getElementById('combo-display')

const renderer = new ARRenderer(canvas, video)
const smoother = new SignSmoother(6)

const detector = new HandDetector({
  onResults: (results) => {
    renderer.resize()
    const landmarks = results.multiHandLandmarks?.[0]
    renderer.drawLandmarks(landmarks)

    if (!landmarks) {
      signDisplay.textContent = 'En attente d\'un signe...'
      smoother.reset()
      return
    }

    const raw = classifySign(landmarks)
    const stable = smoother.update(raw)

    if (raw) {
      signDisplay.textContent = `${raw.label} Signe détecté : en cours de validation...`
    } else {
      signDisplay.textContent = '✋ Main visible — montre un signe !'
    }

    if (stable) {
      console.log('[Signe stable]', stable)
      signDisplay.textContent = `${stable.label} ${ANIMAL_LABEL[stable.animal]} reconnu !`
      // L'agent 04 (combo) prendra la main ici
      window.dispatchEvent(new CustomEvent('sign-detected', { detail: stable }))
    }
  }
})

video.addEventListener('loadedmetadata', () => renderer.resize())

detector.init(video).catch(err => {
  console.error('Erreur caméra:', err)
  signDisplay.textContent = '❌ Accès webcam refusé'
})
```

## Validation
- [ ] Poing fermé → affiche "✊ Chat reconnu !"
- [ ] Doigts V → affiche "✌️ Chien reconnu !"
- [ ] Main ouverte → affiche "🖐 Koala reconnu !"
- [ ] Index seul → affiche "☝️ Panda reconnu !"
- [ ] Pas de flickering (le smoother stabilise bien)
- [ ] Aucun signe fantôme quand la main est absente

## Output attendu
Tester chaque signe manuellement devant la webcam et confirmer la détection dans la console.
