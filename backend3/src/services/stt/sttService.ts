import { EventEmitter } from "events"
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk"
import dotenv from "dotenv"

dotenv.config()

interface STTSession {
  sessionId: string
  connection: any
  isActive: boolean
  createdAt: Date
  socketId: string | null
  lastActivityAt: Date
  audioBuffer: Buffer[]
}

export class STTService extends EventEmitter {
  private deepgram: ReturnType<typeof createClient>
  private sessions: Map<string, STTSession> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    super()

this.testDeepgramConnection()



    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY!)
    console.log("✅ STTService initialized with session isolation")

    // Setup cleanup interval to remove stale sessions
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleSessions()
    }, 30000) // Check every 30 seconds
  }
private async testDeepgramConnection(): Promise<void> {
  try {
    console.log("🔍 Testing Deepgram API key...")
    
    // Check if API key exists
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error("DEEPGRAM_API_KEY not found in environment variables")
    }
    
    console.log(`🔑 API Key found: ${process.env.DEEPGRAM_API_KEY.substring(0, 10)}...`)
    
    const testClient = createClient(process.env.DEEPGRAM_API_KEY!)
    
    // Test with a simpler API call - get projects
    const projectsResponse = await testClient.manage.getProjects()
    console.log("✅ Deepgram API key is valid")
    //@ts-ignore
    console.log(`📊 Found ${projectsResponse.projects?.length || 0} projects`)
    
    // If no projects, that's fine - the key still works
        //@ts-ignore
    if (!projectsResponse.projects || projectsResponse.projects.length === 0) {
      console.log("ℹ️ No projects found, but API key is valid")
    }
    
  } catch (error) {
    console.error("❌ Deepgram API key test failed:", error)
    console.log("Please check your DEEPGRAM_API_KEY in the .env file")
    
    // Don't throw the error, just log it
    console.log("🔄 Continuing with STT service initialization...")
  }
}
  private cleanupStaleSessions(): void {
    const now = new Date()
    const staleThreshold = 5 * 60 * 1000 // 5 minutes

    for (const [sessionId, session] of this.sessions) {
      if (now.getTime() - session.lastActivityAt.getTime() > staleThreshold) {
        console.log(`🧹 Cleaning up stale session: ${sessionId}`)
        this.cleanupSession(sessionId)
      }
    }
  }

  async startSession(sessionId: string, socketId?: string): Promise<void> {
    console.log(`🎤 Starting STT session: ${sessionId}`)

    // Check if session already exists and is active
    const existingSession = this.sessions.get(sessionId)
    if (existingSession?.isActive) {
      console.warn(`⚠️ STT session ${sessionId} already active, updating activity time`)
      existingSession.lastActivityAt = new Date()
      this.emit("connected", { sessionId })
      return
    }

    // Clean up any inactive session with the same ID
    if (existingSession && !existingSession.isActive) {
      await this.cleanupSession(sessionId)
    }

    try {
      // Create new Deepgram live transcription connection
      const connection = this.deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        interim_results: true,
        encoding: "linear16",
        sample_rate: 16000,
        channels: 1,
        endpointing: 300,
        utterance_end_ms: 15000, // Increased timeout
        vad_events: true,
        punctuate: true,
        profanity_filter: false,
        redact: false,
      })

      // Create session object
      const session: STTSession = {
        sessionId,
        connection,
        isActive: false,
        createdAt: new Date(),
        socketId: socketId || null,
        lastActivityAt: new Date(),
        audioBuffer: []
      }

      // Set up connection event handlers
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log(`🎤 Deepgram connection opened for session: ${sessionId}`)
        session.isActive = true
        session.lastActivityAt = new Date()
        this.emit("connected", { sessionId })
        console.log(`🔍 Connection state: ${connection.getReadyState()}`)
      })

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        session.lastActivityAt = new Date()

        if (data.channel?.alternatives?.[0]?.transcript?.trim()) {
          const transcript = {
            sessionId,
            text: data.channel.alternatives[0].transcript,
            confidence: data.channel.alternatives[0].confidence,
            isFinal: data.is_final,
            timestamp: new Date(),
          }

          if (data.is_final) {
            console.log(`📝 Final transcript for ${sessionId}:`, transcript.text)
            this.emit("transcript", transcript)
            console.log(`✅ [STTService] final transcript: "${transcript.text}" for ${sessionId}`)
          } else {
            this.emit("interimTranscript", transcript)
          }
        }
      })

      connection.on(LiveTranscriptionEvents.UtteranceEnd, (data: any) => {
        console.log(`🎤 Utterance ended for session ${sessionId}`)
        session.lastActivityAt = new Date()
        // Don't auto-cleanup on utterance end, let the client decide
      })

      connection.on(LiveTranscriptionEvents.Close, (closeEvent: any) => {
        console.log(`🎤 Deepgram connection closed for session: ${sessionId}`, closeEvent)
        console.log(`🔍 Close code: ${closeEvent.code}, reason: ${closeEvent.reason}`)
        this.emit("disconnected", { sessionId, closeEvent })
        session.isActive = false
      })

      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error(`❌ Deepgram error for session ${sessionId}:`, error)
        this.emit("error", { sessionId, error: error.message })
        session.isActive = false
      })

      // Store the session
      this.sessions.set(sessionId, session)
      console.log(`✅ STT session ${sessionId} started successfully`)

      // Emit state change event
      this.emit("stateChange", { sessionId, state: "ready" })
    } catch (error) {
      console.error(`❌ Failed to start STT session ${sessionId}:`, error)
      this.emit("error", {
        sessionId,
        error: error instanceof Error ? error.message : "Failed to start STT session",
      })
      this.emit("stateChange", { sessionId, state: "error" })
      this.cleanupSession(sessionId)
    }
  }

  processAudioChunk(sessionId: string, audioData: Buffer | ArrayBuffer): void {
    const session = this.sessions.get(sessionId)
    if (!session) {
      console.warn(`⚠️ No STT session found for: ${sessionId}`)
      return
    }

    if (!session.isActive) {
      console.warn(`⚠️ STT session ${sessionId} is not active`)
      return
    }

    if (!session.connection || session.connection.getReadyState() !== 1) {
      console.warn(`⚠️ STT connection not ready for session: ${sessionId}`)
      return
    }

    try {
      // Convert ArrayBuffer to Buffer if needed
      const buffer = audioData instanceof ArrayBuffer ? Buffer.from(audioData) : audioData

      // Convert WebM/Opus to linear16 PCM
      const pcmBuffer = this.convertWebMToPCM(buffer)

      // Update activity timestamp
      session.lastActivityAt = new Date()

      // Send audio data to Deepgram
      if (pcmBuffer && pcmBuffer.length > 0) {
        session.connection.send(pcmBuffer)
        console.log(`📤 Sent ${pcmBuffer.length} bytes PCM to Deepgram for session ${sessionId}`)
      }
    } catch (error) {
      console.error(`❌ Error processing audio chunk for session ${sessionId}:`, error)
      this.emit("error", {
        sessionId,
        error: `Audio processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  private convertWebMToPCM(webmBuffer: Buffer): Buffer {
    try {
      // Simple conversion: extract raw audio data from WebM container
      // This is a simplified approach - in production, you'd use ffmpeg or similar
      
      // For now, we'll assume the buffer contains some audio data and try to extract it
      // Skip WebM headers and metadata (typically first ~1000 bytes contain container info)
      const headerSkip = Math.min(1000, webmBuffer.length / 4)
      const audioData = webmBuffer.slice(headerSkip)
      
      // Convert to 16-bit PCM at 16kHz
      const pcmLength = Math.floor(audioData.length / 2) * 2 // Ensure even length
      const pcmBuffer = Buffer.alloc(pcmLength)
      
      for (let i = 0; i < pcmLength; i += 2) {
        // Simple conversion - copy bytes as-is for now
        // In production, you'd properly decode Opus and resample
        pcmBuffer[i] = audioData[i] || 0
        pcmBuffer[i + 1] = audioData[i + 1] || 0
      }
      
      return pcmBuffer
    } catch (error) {
      console.error("Error converting WebM to PCM:", error)
      return Buffer.alloc(0)
    }
  }

  finishSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) {
      console.warn(`⚠️ No STT session to finish: ${sessionId}`)
      return
    }

    console.log(`🛑 Finishing STT session: ${sessionId}`)
    try {
      if (session.connection && session.isActive) {
        console.log(`🛑 [STTService] finishSession() called for ${sessionId}`)
        session.connection.finish()
      }
    } catch (error) {
      console.error(`❌ Error finishing session ${sessionId}:`, error)
    } finally {
      // Don't immediately cleanup, give some time for final transcripts
      setTimeout(() => {
        this.cleanupSession(sessionId)
      }, 2000) // Wait 2 seconds before cleanup
    }
  }

  // Clean up session by socket ID (when client disconnects)
  cleanupBySocketId(socketId: string): void {
    console.log(`🧹 Cleaning up sessions for socket: ${socketId}`)
    const sessionsToCleanup: string[] = []

    for (const [sessionId, session] of this.sessions) {
      if (session.socketId === socketId) {
        sessionsToCleanup.push(sessionId)
      }
    }

    for (const sessionId of sessionsToCleanup) {
      this.finishSession(sessionId)
    }
  }

  private async cleanupSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return
    }

    console.log(`🧹 Cleaning up STT session: ${sessionId}`)
    try {
      session.isActive = false
      if (session.connection) {
        session.connection.removeAllListeners()
        try {
          if (session.connection.getReadyState() === 1) {
            session.connection.finish()
          }
        } catch (error) {
          console.error(`❌ Error closing connection for session ${sessionId}:`, error)
        }
      }

      this.sessions.delete(sessionId)
      this.emit("sessionCleaned", { sessionId })
    } catch (error) {
      console.error(`❌ Error during cleanup for session ${sessionId}:`, error)
    }
  }

  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter((session) => session.isActive).length
  }

  getSessionInfo(sessionId: string): STTSession | null {
    return this.sessions.get(sessionId) || null
  }

  isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    return session ? session.isActive : false
  }

  getAllActiveSessions(): string[] {
    return Array.from(this.sessions.entries())
      .filter(([_, session]) => session.isActive)
      .map(([sessionId, _]) => sessionId)
  }

  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up all STT sessions")

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    const sessionIds = Array.from(this.sessions.keys())
    for (const sessionId of sessionIds) {
      await this.cleanupSession(sessionId)
    }

    this.sessions.clear()
    console.log("✅ All STT sessions cleaned up")
  }
}
