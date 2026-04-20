# Agent 04 — Système de combos

## Rôle
Tu es l'agent de gestion des combos. Tu captures les séquences de signes dans un buffer temporel et déclenches l'animal correspondant.

## Tâches

### 1. Crée `src/combo/buffer.js` — moteur de combos complet :

```js
/**
 * Buffer temporel pour détecter les séquences de signes
 * Un combo = N signes enchaînés dans un délai maximal
 */
export class ComboBuffer {
  constructor({ maxDelay = 2000, sequenceLength = 2, onCombo, onUpdate }) {
    this.maxDelay = maxDelay           // Délai max entre 2 signes (ms)
    this.sequenceLength = sequenceLength // Nombre de signes pour un combo
    this.onCombo = onCombo             // Callback quand un combo est détecté
    this.onUpdate = onUpdate           // Callback à chaque mise à jour du buffer
    this.buffer = []                   // [{sign, animal, label, timestamp}]
    this.resetTimer = null
  }

  /**
   * Ajoute un signe au buffer
   * @param {Object} signResult - résultat de classifySign
   */
  push(signResult) {
    const now = Date.now()

    // Ignore si c'est le même signe que le précédent (évite doublons)
    if (this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1]
      if (last.sign === signResult.sign) return
    }

    // Vide le buffer si le délai est dépassé
    if (this.buffer.length > 0) {
      const lastTime = this.buffer[this.buffer.length - 1].timestamp
      if (now - lastTime > this.maxDelay) {
        this.buffer = []
      }
    }

    // Ajoute le signe
    this.buffer.push({ ...signResult, timestamp: now })
    this.onUpdate?.(this.buffer)

    // Reset timer
    clearTimeout(this.resetTimer)
    this.resetTimer = setTimeout(() => {
      this.buffer = []
      this.onUpdate?.([])
    }, this.maxDelay)

    // Vérifie si on a un combo complet
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

  /**
   * Dictionnaire de combos : séquence de signes → animal
   * Format : 'sign1+sign2' → { animal, emoji, label, description }
   */
  _matchCombo(seq) {
    const key = seq.map(s => s.sign).join('+')

    const combos = {
      // Combos 2 signes
      'fist+fist':    { animal: 'cat',   emoji: '🐱', label: 'Chat',  description: 'Double poing' },
      'fist+peace':   { animal: 'cat',   emoji: '🐱', label: 'Chat',  description: 'Poing puis V' },
      'peace+peace':  { animal: 'dog',   emoji: '🐶', label: 'Chien', description: 'Double V' },
      'peace+point':  { animal: 'dog',   emoji: '🐶', label: 'Chien', description: 'V puis index' },
      'open+open':    { animal: 'koala', emoji: '🐨', label: 'Koala', description: 'Double main ouverte' },
      'open+fist':    { animal: 'koala', emoji: '🐨', label: 'Koala', description: 'Main ouverte puis poing' },
      'point+point':  { animal: 'panda', emoji: '🐼', label: 'Panda', description: 'Double index' },
      'point+open':   { animal: 'panda', emoji: '🐼', label: 'Panda', description: 'Index puis main ouverte' },
      // Combos croisés bonus
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
```

### 2. Met à jour `src/main.js` pour intégrer le ComboBuffer :
Remplace complètement `main.js` par :

```js
import { HandDetector } from './gestures/detector.js'
import { ARRenderer } from './ar/renderer.js'
import { classifySign, SignSmoother, ANIMAL_EMOJI, ANIMAL_LABEL } from './gestures/signs.js'
import { ComboBuffer } from './combo/buffer.js'

const video = document.getElementById('webcam')
const canvas = document.getElementById('overlay')
const signDisplay = document.getElementById('sign-display')
const comboDisplay = document.getElementById('combo-display')
const animalPopup = document.getElementById('animal-popup')

const renderer = new ARRenderer(canvas, video)
const smoother = new SignSmoother(6)

// ─── Combo system ─────────────────────────────────────────────────
const combo = new ComboBuffer({
  maxDelay: 2000,
  sequenceLength: 2,

  onUpdate: (buffer) => {
    // Affiche les signes actuellement dans le buffer
    comboDisplay.textContent = buffer.map(s => s.label).join(' + ')
  },

  onCombo: (result) => {
    console.log('[COMBO]', result)
    showAnimal(result)
  }
})

// ─── Affichage de l'animal ─────────────────────────────────────────
function showAnimal(result) {
  animalPopup.textContent = result.emoji
  animalPopup.classList.remove('hidden')

  // Animation entrée
  requestAnimationFrame(() => {
    animalPopup.classList.add('visible')
  })

  // Disparaît après 3 secondes
  setTimeout(() => {
    animalPopup.classList.remove('visible')
    setTimeout(() => animalPopup.classList.add('hidden'), 400)
  }, 3000)

  signDisplay.textContent = `🎉 ${result.emoji} ${result.label} invoqué ! (${result.description})`
}

// ─── Détection ────────────────────────────────────────────────────
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

    if (raw && !stable) {
      signDisplay.textContent = `${raw.label} en cours...`
    } else if (!raw) {
      signDisplay.textContent = '✋ Main visible — montre un signe !'
    }

    if (stable) {
      signDisplay.textContent = `${stable.label} ${ANIMAL_LABEL[stable.animal]} !`
      combo.push(stable)
    }
  }
})

video.addEventListener('loadedmetadata', () => renderer.resize())

detector.init(video).catch(err => {
  console.error('[Erreur caméra]', err)
  signDisplay.textContent = '❌ Accès webcam refusé — vérifie les permissions'
})
```

## Validation
- [ ] Faire ✊ puis ✌️ → l'emoji du chat/chien apparaît
- [ ] Si trop lent (> 2s) → le buffer se vide sans déclencher
- [ ] Les emojis du buffer s'affichent en temps réel dans `#combo-display`
- [ ] L'animal disparaît proprement après 3 secondes
- [ ] Pas de déclenchement accidentel sur un seul signe

## Output attendu
Confirme un combo réussi en console : `[COMBO] { animal: 'cat', emoji: '🐱', label: 'Chat', ... }`
