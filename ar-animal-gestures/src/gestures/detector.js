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
      maxNumHands: 2,
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
