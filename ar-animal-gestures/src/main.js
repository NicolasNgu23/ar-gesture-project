import { HandDetector } from './gestures/detector.js'
import { ARRenderer } from './ar/renderer.js'
import { classifySign, SignSmoother } from './gestures/signs.js'
import { RaceLane, SIGN_LABELS, formatTime } from './game/race.js'

const video = document.getElementById('webcam')
const canvas = document.getElementById('overlay')
const camDot = document.getElementById('cam-dot')
const camLabel = document.getElementById('cam-label')

const renderer = new ARRenderer(canvas, video)

const lane1 = new RaceLane({ totalSigns: 20 })
const lane2 = new RaceLane({ totalSigns: 20 })
const smoother1 = new SignSmoother(5)
const smoother2 = new SignSmoother(5)

let gameOver = false

const horse1 = document.getElementById('horse-1')
const horse2 = document.getElementById('horse-2')
const timer1 = document.getElementById('timer-1')
const timer2 = document.getElementById('timer-2')
const queue1 = document.getElementById('queue-1')
const queue2 = document.getElementById('queue-2')
const status1 = document.getElementById('status-1')
const status2 = document.getElementById('status-2')
const winnerBanner = document.getElementById('winner-banner')
const winnerText = document.getElementById('winner-text')
const restartBtn = document.getElementById('restart-btn')

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
    laneEl.classList.remove('flash-penalty', 'flash-boost')
    void laneEl.offsetWidth
    laneEl.classList.add(`flash-${flashEvent}`)
  }
}

function tick() {
  if (!gameOver) {
    timer1.textContent = formatTime(lane1.elapsed)
    timer2.textContent = formatTime(lane2.elapsed)
  }
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)

function handleSign(lane, smoother, statusEl, horseEl, laneEl, queueEl, playerName, raw) {
  if (gameOver) return
  const stable = smoother.update(raw)

  if (raw && !stable) {
    statusEl.textContent = `${raw.label} en cours...`
  } else if (!raw) {
    statusEl.textContent = '— en attente'
    smoother.reset()
  }

  if (stable) {
    const { correct, penalty, boost } = lane.checkSign(stable.sign)

    if (correct) {
      statusEl.textContent = boost ? `⚡ BOOST ! ${stable.label}` : `✅ ${stable.label}`
    } else {
      statusEl.textContent = penalty
        ? `💥 -2 cases ! (attendu : ${SIGN_LABELS[lane.currentSign]})`
        : `❌ ${stable.label} (attendu : ${SIGN_LABELS[lane.currentSign]})`
    }

    const flashEvent = penalty ? 'penalty' : boost ? 'boost' : null
    setHorsePos(horseEl, laneEl, lane.progress, flashEvent)
    renderQueue(queueEl, lane)

    if (lane.finished && !gameOver) {
      gameOver = true
      winnerText.textContent = `🏆 ${playerName} gagne !`
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

const detector = new HandDetector({
  onResults: (results) => {
    renderer.resize()
    const allLandmarks = results.multiHandLandmarks || []
    allLandmarks.forEach(lm => renderer.drawLandmarks(lm))

    if (!window._camReady && allLandmarks.length > 0) {
      window._camReady = true
      camDot.classList.add('active')
      camLabel.textContent = 'Webcam active'
    }

    const [lm1, lm2] = assignHands(allLandmarks)
    handleSign(lane1, smoother1, status1, horse1, document.getElementById('lane-p1'), queue1, 'Joueur 1', lm1 ? classifySign(lm1) : null)
    handleSign(lane2, smoother2, status2, horse2, document.getElementById('lane-p2'), queue2, 'Joueur 2', lm2 ? classifySign(lm2) : null)
  }
})

renderQueue(queue1, lane1)
renderQueue(queue2, lane2)

restartBtn.addEventListener('click', () => {
  lane1.reset(); lane2.reset()
  smoother1.reset(); smoother2.reset()
  gameOver = false
  winnerBanner.classList.remove('visible')
  setHorsePos(horse1, document.getElementById('lane-p1'), 0, null)
  setHorsePos(horse2, document.getElementById('lane-p2'), 0, null)
  renderQueue(queue1, lane1)
  renderQueue(queue2, lane2)
  status1.textContent = '— en attente'
  status2.textContent = '— en attente'
  timer1.textContent = '00:00.0'
  timer2.textContent = '00:00.0'
})

video.addEventListener('loadedmetadata', () => renderer.resize())

detector.init(video).catch(err => {
  console.error('[Erreur caméra]', err)
  camLabel.textContent = 'Webcam indisponible'
})

window.addEventListener('beforeunload', () => detector.stop())
