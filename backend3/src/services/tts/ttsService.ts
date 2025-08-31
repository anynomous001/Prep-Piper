import { EventEmitter } from "events"

type AudioGeneratedPayload = {
  sessionId: string
  audioUrl: string | null
  text?: string
  duration?: number
  timestamp?: Date
}

export class TTSService extends EventEmitter {
  private currentSessionId: string | null = null

  constructor() {
    super()
    // Intentionally no external dependencies; TTS is disabled by default
  }

  async speak(text: string, sessionId: string) {
    // No-op; emit optional informational status if needed
    this.currentSessionId = sessionId
    this.emit("status", { sessionId, message: "TTS disabled - skipping synthesis" })

    // Do NOT emit audioGenerated since there is no audio.
    // Optionally notify completion without audio so clients can proceed if they rely on this.
    const payload: AudioGeneratedPayload = {
      sessionId,
      audioUrl: null,
      text,
      duration: 0,
      timestamp: new Date(),
    }
    // this.emit('audioGenerated', payload) // skip to avoid downstream audio logic
    this.emit("audioFinished", { sessionId, audioUrl: null })
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId
  }

  stop() {
    this.currentSessionId = null
  }
}
