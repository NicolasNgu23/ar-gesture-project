import { HandDetector } from './gestures/detector.js'
import { ARRenderer } from './ar/renderer.js'
import { ThreeARLayer } from './ar/three-layer.js'
import { classifySign, SignSmoother } from './gestures/signs.js'
import { RaceLane, SIGN_LABELS, formatTime } from './game/race.js'

const video        = document.getElementById('webcam')
const canvas       = document.getElementById('overlay')
const camDot       = document.getElementById('cam-dot')
const camLabel     = document.getElementById('cam-label')

const renderer   = new ARRenderer(canvas, video)
const threeLayer = new ThreeARLayer(document.getElementById('three-canvas'), video)

const lane1 = new RaceLane({ totalSigns: 20 })
const lane2 = new RaceLane({ totalSigns: 20 })
const smoother1 = new SignSmoother(5)
const smoother2 = new SignSmoother(5)

let gameOver = false
let gameReady = false
let solo = false
let latestFaces = []

// DOM refs
const horse1      = document.getElementById('horse-1')
const horse2      = document.getElementById('horse-2')
const timer1      = document.getElementById('timer-1')
const timer2      = document.getElementById('timer-2')
const queue1      = document.getElementById('queue-1')
const queue2      = document.getElementById('queue-2')
const status1     = document.getElementById('status-1')
const status2     = document.getElementById('status-2')
const laneP2      = document.getElementById('lane-p2')
const laneDivider = document.querySelector('.lane-divider')
const winnerBanner  = document.getElementById('winner-banner')
const winnerText    = document.getElementById('winner-text')
const loserText     = document.getElementById('loser-text')
const resultCamSlot = document.getElementById('result-cam-slot')
const webcamArea    = document.getElementById('webcam-area')
const camContainer  = document.getElementById('camera-container')
const webcamInfo    = document.getElementById('webcam-info')
const restartBtn    = document.getElementById('restart-btn')
const modeScreen       = document.getElementById('mode-screen')
const buzzerOverlay    = document.getElementById('buzzer-overlay')
const buzzerBtn        = document.getElementById('buzzer-btn')
const charPickers      = document.getElementById('char-pickers')
const countdownOverlay = document.getElementById('countdown-overlay')
const countdownNumber  = document.getElementById('countdown-number')

const CHARACTERS = ['🏎️','🏇','🚶','🐢','🚀','🦘','🐌','🚲']
let selectedChars = ['🏇', '🏇']

function buildCharPickers() {
  charPickers.innerHTML = ''
  const players = solo ? [0] : [0, 1]
  const labels  = ['Joueur 1', 'Joueur 2']
  const colors  = ['var(--p1)', 'var(--p2)']

  players.forEach(idx => {
    const picker = document.createElement('div')
    picker.className = 'char-picker'

    const label = document.createElement('div')
    label.className = 'char-picker-label'
    label.textContent = labels[idx]
    label.style.color = colors[idx]

    const opts = document.createElement('div')
    opts.className = 'char-options'

    CHARACTERS.forEach(char => {
      const btn = document.createElement('button')
      btn.className = 'char-opt' + (selectedChars[idx] === char ? ' selected' : '')
      btn.textContent = char
      btn.addEventListener('click', () => {
        selectedChars[idx] = char
        opts.querySelectorAll('.char-opt').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        ;[horse1, horse2][idx].textContent = char
      })
      opts.appendChild(btn)
    })

    picker.appendChild(label)
    picker.appendChild(opts)
    charPickers.appendChild(picker)
  })
}

// ── Mode selection ───────────────────────────────────────
document.getElementById('btn-solo').addEventListener('click', () => startGame(true))
document.getElementById('btn-duo').addEventListener('click',  () => startGame(false))

function startGame(isSolo) {
  solo = isSolo
  laneP2.style.display      = solo ? 'none' : ''
  laneDivider.style.display = solo ? 'none' : ''
  modeScreen.classList.add('hidden')
  resetState()
  horse1.textContent = selectedChars[0]
  horse2.textContent = selectedChars[1]
  buildCharPickers()
  buzzerOverlay.classList.add('active')
}

// ── Buzzer + countdown ───────────────────────────────────
buzzerBtn.addEventListener('click', () => {
  buzzerOverlay.classList.remove('active')
  runCountdown()
})

function runCountdown() {
  const steps = ['3', '2', '1', 'GO !']
  let i = 0
  countdownOverlay.classList.add('active')

  function next() {
    countdownNumber.textContent = steps[i]
    countdownNumber.style.animation = 'none'
    void countdownNumber.offsetWidth
    countdownNumber.style.animation = ''
    i++
    if (i < steps.length) {
      setTimeout(next, 900)
    } else {
      setTimeout(() => {
        countdownOverlay.classList.remove('active')
        gameReady = true
      }, 900)
    }
  }
  next()
}

// ── Game logic ───────────────────────────────────────────
function resetState() {
  lane1.reset(); lane2.reset()
  smoother1.reset(); smoother2.reset()
  gameOver = false
  setHorsePos(horse1, document.getElementById('lane-p1'), 0, null)
  setHorsePos(horse2, document.getElementById('lane-p2'), 0, null)
  renderQueue(queue1, lane1)
  renderQueue(queue2, lane2)
  status1.textContent = '— en attente'
  status2.textContent = '— en attente'
  timer1.textContent  = '00:00.0'
  timer2.textContent  = '00:00.0'
}

function renderQueue(el, lane) {
  el.innerHTML = lane.upcomingSigns.map((sign, i) => {
    const label = SIGN_LABELS[sign]
    return i === 0
      ? `<span class="sign-current">${label}</span>`
      : `<span class="sign-next">${label}</span>`
  }).join('<span class="sign-arrow">›</span>')
}

function setHorsePos(el, laneEl, progress, flashEvent) {
  el.style.left = `${2 + progress * 88}%`
  if (flashEvent) {
    laneEl.classList.remove('flash-penalty')
    void laneEl.offsetWidth
    laneEl.classList.add(`flash-${flashEvent}`)
  }
}

function tick() {
  if (!gameOver) {
    timer1.textContent = formatTime(lane1.elapsed)
    if (!solo) timer2.textContent = formatTime(lane2.elapsed)
  }
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)

function handleSign(lane, smoother, statusEl, horseEl, laneEl, queueEl, playerName, raw) {
  if (!gameReady || gameOver) return
  const stable = smoother.update(raw)

  if (raw && !stable) {
    statusEl.textContent = `${raw.label} en cours...`
  } else if (!raw) {
    statusEl.textContent = '— en attente'
    smoother.reset()
  }

  if (stable) {
    const { correct, penalty } = lane.checkSign(stable.sign)

    if (correct) {
      statusEl.textContent = `✅ ${stable.label}`
    } else {
      statusEl.textContent = penalty
        ? `💥 -2 cases ! (attendu : ${SIGN_LABELS[lane.currentSign]})`
        : `❌ ${stable.label} (attendu : ${SIGN_LABELS[lane.currentSign]})`
    }

    setHorsePos(horseEl, laneEl, lane.progress, penalty ? 'penalty' : null)
    renderQueue(queueEl, lane)

    if (lane.finished && !gameOver) {
      gameOver = true
      if (solo) {
        winnerText.textContent = `🏆 Terminé ! — ${formatTime(lane.elapsed)}`
        loserText.textContent  = ''
      } else {
        const loserLane = lane === lane1 ? lane2 : lane1
        const loserName = lane === lane1 ? 'Joueur 2' : 'Joueur 1'
        winnerText.textContent = `🏆 ${playerName} gagne ! — ${formatTime(lane.elapsed)}`
        loserText.textContent  = `${loserName} — ${loserLane.currentIndex} / ${loserLane.totalSigns} gestes`
      }
      resultCamSlot.appendChild(camContainer)
      winnerBanner.classList.add('visible')
    }
  }
}

function assignHands(landmarks) {
  if (!landmarks || landmarks.length === 0) return [null, null]
  if (landmarks.length === 1) return [landmarks[0], null]
  const sorted = [...landmarks].sort((a, b) => b[0].x - a[0].x)
  return [sorted[0], sorted[1]]
}

function updateCrown() {
  if (solo) { threeLayer.setCrown(null, null); return }
  const leaderIdx = lane1.progress >= lane2.progress ? 0 : 1
  const face = latestFaces[leaderIdx]
  if (!face) { threeLayer.setCrown(null, null); return }
  const bb = face.boundingBox
  threeLayer.setCrown(bb.xCenter, bb.yCenter - bb.height * 0.85)
}

// ── Detector ─────────────────────────────────────────────
const detector = new HandDetector({
  onResults: (results) => {
    renderer.resize()
    threeLayer.resize()
    const allLandmarks = results.multiHandLandmarks || []

    if (!window._camReady && allLandmarks.length > 0) {
      window._camReady = true
      camDot.classList.add('active')
      camLabel.textContent = 'Webcam active'
    }

    const [lm1, lm2] = assignHands(allLandmarks)
    if (lm1) renderer.drawLandmarks(lm1)
    if (lm2) renderer.drawLandmarks(lm2)

    updateCrown()

    // Only process if a mode has been chosen
    if (modeScreen.classList.contains('hidden')) {
      const hand = solo ? (lm1 || lm2) : lm1
      handleSign(lane1, smoother1, status1, horse1, document.getElementById('lane-p1'), queue1, 'Joueur 1', hand ? classifySign(hand) : null)
      if (!solo) {
        handleSign(lane2, smoother2, status2, horse2, document.getElementById('lane-p2'), queue2, 'Joueur 2', lm2 ? classifySign(lm2) : null)
      }
    }
  },
  onFaceResults: (results) => {
    const faces = results.detections || []
    latestFaces = [...faces].sort((a, b) => b.boundingBox.xCenter - a.boundingBox.xCenter)
  }
})

renderQueue(queue1, lane1)
renderQueue(queue2, lane2)

restartBtn.addEventListener('click', () => {
  gameReady = false
  webcamArea.insertBefore(camContainer, webcamInfo)
  winnerBanner.classList.remove('visible')
  modeScreen.classList.remove('hidden')
})

video.addEventListener('loadedmetadata', () => renderer.resize())

detector.init(video).catch(err => {
  console.error('[Erreur caméra]', err)
  camLabel.textContent = 'Webcam indisponible'
})

window.addEventListener('beforeunload', () => detector.stop())
