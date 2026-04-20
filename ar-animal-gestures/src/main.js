import { HandDetector } from './gestures/detector.js'
import { ARRenderer } from './ar/renderer.js'
import { classifySign, SignSmoother, ANIMAL_EMOJI, ANIMAL_LABEL } from './gestures/signs.js'
import { ComboBuffer } from './combo/buffer.js'

const video = document.getElementById('webcam')
const canvas = document.getElementById('overlay')
const signDisplay = document.getElementById('sign-display')
const comboDisplay = document.getElementById('combo-display')
const camDot = document.getElementById('cam-dot')
const camLabel = document.getElementById('cam-label')
const animalPopupEmoji = document.getElementById('animal-popup-emoji')
const animalPopupLabel = document.getElementById('animal-popup-label')

const renderer = new ARRenderer(canvas, video)
const smoother = new SignSmoother(6)
let lastLandmarks = null

const combo = new ComboBuffer({
  maxDelay: 2000,
  sequenceLength: 2,

  onUpdate: (buffer) => {
    comboDisplay.textContent = buffer.map(s => s.label).join(' + ')
  },

  onCombo: (result) => {
    console.log('[COMBO]', result)
    const wrist = renderer.getWristPosition(lastLandmarks)
    renderer.showAnimal(result.animal, wrist)
    showAnimal(result)
  }
})

function showAnimal(result) {
  const popup = document.getElementById('animal-popup')
  animalPopupEmoji.textContent = result.emoji
  animalPopupLabel.textContent = result.label

  popup.classList.remove('hidden')
  requestAnimationFrame(() => popup.classList.add('visible'))

  spawnParticles()

  setTimeout(() => {
    popup.classList.remove('visible')
  }, 3000)

  signDisplay.textContent = `🎉 ${result.emoji} ${result.label} !`
}

function spawnParticles() {
  const container = document.getElementById('camera-container')
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    const angle = (i / 8) * 360
    const dist = 60 + Math.random() * 40
    p.style.cssText = `
      left: 50%; top: 40%;
      --tx: ${Math.cos(angle * Math.PI / 180) * dist}px;
      --ty: ${Math.sin(angle * Math.PI / 180) * dist}px;
      background: hsl(${angle}, 80%, 65%);
      animation-delay: ${i * 30}ms;
    `
    container.appendChild(p)
    setTimeout(() => p.remove(), 800)
  }
}

const detector = new HandDetector({
  onResults: (results) => {
    renderer.resize()
    const landmarks = results.multiHandLandmarks?.[0]
    lastLandmarks = landmarks
    renderer.drawLandmarks(landmarks)

    if (!window._camReady) {
      window._camReady = true
      camDot.classList.add('active')
      camLabel.textContent = 'Webcam active'
    }

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
  camLabel.textContent = 'Webcam indisponible'
})

window.addEventListener('beforeunload', () => detector.stop())
