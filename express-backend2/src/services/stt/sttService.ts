import { EventEmitter } from 'events'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import dotenv from 'dotenv'

dotenv.config()

interface STTSession {
  sessionId: string
  connection: any
  isActive: boolean
  createdAt: Date
  socketId: string | null
}

export class STTService extends EventEmitter {
  private deepgram: ReturnType<typeof createClient>
  private sessions: Map<string, STTSession> = new Map()
  
  constructor() {
    super()
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY!)
    console.log('✅ STTService initialized with session isolation')
  }

  async startSession(sessionId: string, socketId?: string): Promise<void> {
    console.log(`🎤 Starting STT session: ${sessionId}`)

    // Check if session already exists and is active
    const existingSession = this.sessions.get(sessionId)
    if (existingSession?.isActive) {
      console.warn(`⚠️ STT session ${sessionId} already active, skipping`)
      this.emit('error', { sessionId, error: 'STT session already active' })
      return
    }

    // Clean up any inactive session with the same ID
    if (existingSession && !existingSession.isActive) {
      await this.cleanupSession(sessionId)
    }

    try {
      // Create new Deepgram live transcription connection
      const connection = this.deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        endpointing: 300,
        utterance_end_ms: 1500,
      })

      // Create session object
      const session: STTSession = {
        sessionId,
        connection,
        isActive: false,
        createdAt: new Date(),
        socketId: socketId || null,
      }

      // Set up connection event handlers
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log(`🎤 Deepgram connection opened for session: ${sessionId}`)
        session.isActive = true
        this.emit('connected', { sessionId })
      })

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        if (data.channel.alternatives[0].transcript.trim()) {
          const transcript = {
            sessionId,
            text: data.channel.alternatives[0].transcript,
            confidence: data.channel.alternatives[0].confidence,
            isFinal: data.is_final,
            timestamp: new Date(),
          }

          if (data.is_final) {
            console.log(`📝 Final transcript for ${sessionId}:`, transcript.text)
            this.emit('transcript', transcript)
          } else {
            this.emit('interimTranscript', transcript)
          }
        }
      })

      connection.on(LiveTranscriptionEvents.Close, (closeEvent: any) => {
        console.log(`🎤 Deepgram connection closed for session: ${sessionId}`)
        this.emit('disconnected', { sessionId, closeEvent })
        this.cleanupSession(sessionId)
      })

      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error(`❌ Deepgram error for session ${sessionId}:`, error)
        this.emit('error', { sessionId, error: error.message })
        this.cleanupSession(sessionId)
      })

      // Store the session
      this.sessions.set(sessionId, session)
      console.log(`✅ STT session ${sessionId} started successfully`)
      
      // Emit state change event
      this.emit('stateChange', { sessionId, state: 'ready' })
      
    } catch (error) {
      console.error(`❌ Failed to start STT session ${sessionId}:`, error)
      this.emit('error', { 
        sessionId, 
        error: error instanceof Error ? error.message : 'Failed to start STT session' 
      })
      this.emit('stateChange', { sessionId, state: 'error' })
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
      const buffer = audioData instanceof ArrayBuffer 
        ? Buffer.from(audioData) 
        : audioData

      // Send audio data to Deepgram
      session.connection.send(buffer)
      
    } catch (error) {
      console.error(`❌ Error processing audio chunk for session ${sessionId}:`, error)
      this.emit('error', {
        sessionId,
        error: `Audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
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
        session.connection.finish()
      }
    } catch (error) {
      console.error(`❌ Error finishing session ${sessionId}:`, error)
    } finally {
      this.cleanupSession(sessionId)
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
          session.connection.finish()
        } catch (error) {
          console.error(`❌ Error closing connection for session ${sessionId}:`, error)
        }
      }

      this.sessions.delete(sessionId)
      this.emit('sessionCleaned', { sessionId })
      
    } catch (error) {
      console.error(`❌ Error during cleanup for session ${sessionId}:`, error)
    }
  }

  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(session => session.isActive).length
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
    console.log('🧹 Cleaning up all STT sessions')
    
    const sessionIds = Array.from(this.sessions.keys())
    
    for (const sessionId of sessionIds) {
      await this.cleanupSession(sessionId)
    }
    
    this.sessions.clear()
    console.log('✅ All STT sessions cleaned up')
  }
}