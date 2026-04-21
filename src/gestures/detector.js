export class HandDetector {
  constructor({ onResults, onFaceResults }) {
    this.onResults = onResults
    this.onFaceResults = onFaceResults
    this.hands = null
    this.faceDetection = null
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
    this.hands.onResults((results) => this.onResults(results))

    if (this.onFaceResults) {
      this.faceDetection = new FaceDetection({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`
      })
      this.faceDetection.setOptions({ model: 'short', minDetectionConfidence: 0.5 })
      this.faceDetection.onResults(this.onFaceResults)
    }

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement })
        if (this.faceDetection) await this.faceDetection.send({ image: videoElement })
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
