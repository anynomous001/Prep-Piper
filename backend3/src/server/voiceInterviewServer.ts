import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { STTService } from "../services/stt/sttService.js"
import { TTSService } from "../services/tts/ttsService.js"
import { InterviewAgent } from "../services/interview/interviewAgent.js"

dotenv.config()

interface STTEventData {
  sessionId: string
  text?: string
  confidence?: number
  error?: string
}

interface ActiveSession {
  sessionId: string
  socketId: string
  createdAt: Date
  techStack?: string
  position?: string
  lastActivityAt: Date
}

export class VoiceInterviewServer {
  private app: express.Application
  private server: http.Server
  private io: Server
  private sttService: STTService
  private ttsService: TTSService
  private agent: InterviewAgent
  private activeSessions: Map<string, ActiveSession>
  private socketToSession: Map<string, string> // socket.id -> sessionId
  private ttsEnabled: boolean = process.env.ENABLE_TTS === "true"

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)
    this.activeSessions = new Map()
    this.socketToSession = new Map()

    // Initialize Socket.IO with proper CORS
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      allowEIO3: true,
    })

    // Initialize services
    this.sttService = new STTService()
    this.ttsService = new TTSService()
    this.agent = new InterviewAgent()

    this.setupMiddleware()
    this.setupRoutes()
    this.setupSocketHandlers()
    this.setupServiceEvents()

    // Ensure audio output directory exists
    this.ensureAudioDirectory()

    console.log("✅ VoiceInterviewServer initialized with session isolation")
    if (!this.ttsEnabled) {
      console.log("🔇 TTS is disabled (set ENABLE_TTS=true to enable)")
    }
  }

  private ensureAudioDirectory(): void {
    const audioDir = path.join(process.cwd(), "audio_output")
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
      console.log("📁 Created audio_output directory")
    }
  }

  private setupMiddleware(): void {
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      }),
    )
    this.app.use(express.json())
    this.app.use(express.static("public"))
    this.app.use("/audio", express.static("audio_output"))
  }

  private setupRoutes(): void {
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        activeSessions: this.activeSessions.size,
        activeSTTSessions: this.sttService.getActiveSessionsCount(),
        activeSessionDetails: Array.from(this.activeSessions.values()).map((session) => ({
          sessionId: session.sessionId,
          socketId: session.socketId,
          createdAt: session.createdAt,
          sttActive: this.sttService.isSessionActive(session.sessionId),
          lastActivity: session.lastActivityAt,
        })),
      })
    })

    this.app.get("/session/:sessionId", (req, res) => {
      const { sessionId } = req.params
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        return res.status(404).json({ error: "Session not found" })
      }

      res.json({
        sessionId: session.sessionId,
        socketId: session.socketId,
        createdAt: session.createdAt,
        sttActive: this.sttService.isSessionActive(sessionId),
        sttInfo: this.sttService.getSessionInfo(sessionId),
        lastActivity: session.lastActivityAt,
      })
    })
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`)

      socket.on("startInterview", async (data) => {
        try {
          const sessionId = uuidv4().substring(0, 8)
          console.log(`🎯 Starting interview:`, {
            sessionId,
            socketId: socket.id,
            techStack: data.techStack,
            position: data.position,
          })

          const session: ActiveSession = {
            sessionId,
            socketId: socket.id,
            createdAt: new Date(),
            techStack: data.techStack,
            position: data.position,
            lastActivityAt: new Date(),
          }

          this.activeSessions.set(sessionId, session)
          this.socketToSession.set(socket.id, sessionId)
          socket.join(sessionId)

          // Start STT session first
          await this.sttService.startSession(sessionId, socket.id)

          // Initialize interview agent
          const [agentSessionId, question] = this.agent.startInterview(data.techStack, data.position, sessionId)

          this.io.to(sessionId).emit("interviewStarted", {
            sessionId,
            question: { questionText: question },
          })

          console.log(`✅ Interview started successfully for session: ${sessionId}`)

          // Generate TTS for the initial question
          if (this.ttsEnabled) {
            await this.generateTTSAudio(sessionId, question)
          }
        } catch (error) {
          console.error(`❌ Error starting interview:`, error)
          socket.emit("error", "Failed to start interview")
        }
      })




      // Add this in setupSocketHandlers() method after the existing socket handlers

socket.on("textResponse", (data) => {
  const { sessionId, text } = data
  if (!sessionId || !text) {
    console.error("❌ Invalid text response data")
    return
  }

  const session = this.activeSessions.get(sessionId)
  if (!session) {
    console.error(`❌ Invalid session for text response: ${sessionId}`)
    return
  }

  if (session.socketId !== socket.id) {
    console.error(`❌ Socket ${socket.id} doesn't own session ${sessionId}`)
    return
  }

  // Update activity timestamp
  session.lastActivityAt = new Date()

  console.log(`📝 Text response received for ${sessionId}:`, text)

  // Emit transcript event to frontend for display
  this.io.to(sessionId).emit("transcript", {
    sessionId,
    text: text.trim(),
    confidence: 1.0,
    isFinal: true,
    timestamp: new Date(),
    source: "text" // Indicate this came from text input
  })

  // Process answer through interview agent directly
  this.agent.processAnswer(sessionId, text.trim())
})

      socket.on("audioChunk", (data) => {
        const { sessionId, audioData } = data
        if (!sessionId) {
          console.error("❌ No sessionId provided with audio chunk")
          return
        }

        const session = this.activeSessions.get(sessionId)
        if (!session) {
          console.error(`❌ Invalid session for audio chunk: ${sessionId}`)
          return
        }

        if (session.socketId !== socket.id) {
          console.error(`❌ Socket ${socket.id} doesn't own session ${sessionId}`)
          return
        }

        // Update activity timestamp
        session.lastActivityAt = new Date()

        try {
          const buffer = Buffer.from(audioData)
          this.sttService.processAudioChunk(sessionId, buffer)
        } catch (error) {
          console.error(`❌ Error processing audio chunk for ${sessionId}:`, error)
        }
      })

      socket.on("finalizeAudio", (data) => {
        const { sessionId } = data
        if (sessionId && this.activeSessions.has(sessionId)) {
          console.log(`🎤 Finalizing audio for session: ${sessionId}`)
          const session = this.activeSessions.get(sessionId)
          if (session) {
            session.lastActivityAt = new Date()
          }
          this.sttService.finishSession(sessionId)
        }
      })

      socket.on("endInterview", (data) => {
        const { sessionId } = data
        if (sessionId) {
          this.cleanupSession(sessionId)
          this.io.to(sessionId).emit("interviewComplete", { sessionId })
        }
      })

      socket.on("validateSession", (data, callback) => {
        const { sessionId } = data
        const session = this.activeSessions.get(sessionId)
        callback({ valid: !!session && session.socketId === socket.id })
      })

      socket.on("reestablishSession", (data) => {
        const { sessionId, techStack, position } = data
        const existingSession = this.activeSessions.get(sessionId)
        if (existingSession) {
          // Update socket mapping and activity time
          existingSession.socketId = socket.id
          existingSession.lastActivityAt = new Date()
          this.socketToSession.set(socket.id, sessionId)
          socket.join(sessionId)

          console.log(`🔄 Reestablished session ${sessionId} for socket ${socket.id}`)

          // Notify client
          socket.emit("sessionReestablished", {
            sessionId,
            status: "active",
          })
        }
      })

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`)
        const sessionId = this.socketToSession.get(socket.id)

        // Don't cleanup session immediately on disconnect
        // Give time for potential reconnection
        if (sessionId) {
          setTimeout(() => {
            const session = this.activeSessions.get(sessionId)
            // Only cleanup if socket hasn't reconnected
            if (session && session.socketId === socket.id) {
              console.log(`🧹 Auto-cleaning up session ${sessionId} after disconnect timeout`)
              this.cleanupSession(sessionId)
            }
          }, 10000) // 10 second grace period for reconnection
        }

        this.sttService.cleanupBySocketId(socket.id)
      })

      socket.on("error", (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error)
      })
    })
  }

  private setupServiceEvents(): void {
    // STT Handlers
    this.sttService.on("connected", (data: STTEventData) => {
      const { sessionId } = data
      const session = this.activeSessions.get(sessionId)
      if (session) {
        session.lastActivityAt = new Date()
        this.io.to(sessionId).emit("sttConnected", { sessionId })
        console.log(`🎤 STT connected for session: ${sessionId}`)
      }
    })

    this.sttService.on("interimTranscript", (data: STTEventData) => {
      const { sessionId, text, confidence } = data
      const session = this.activeSessions.get(sessionId)
      if (session && text?.trim()) {
        session.lastActivityAt = new Date()
        this.io.to(sessionId).emit("interimTranscript", {
          sessionId,
          text,
          confidence,
          timestamp: new Date(),
        })
      }
    })

    this.sttService.on("transcript", (data: STTEventData) => {
      const { sessionId, text, confidence } = data
      const session = this.activeSessions.get(sessionId)
      if (session && text?.trim()) {
        session.lastActivityAt = new Date()
        this.io.to(sessionId).emit("transcript", {
          sessionId,
          text,
          confidence,
          isFinal: true,
          timestamp: new Date(),
        })

        // Process answer through interview agent
        console.log(`📝 Processing answer through agent for ${sessionId}:`, text)
        this.agent.processAnswer(sessionId, text)
      }
    })

    this.sttService.on("error", (data: STTEventData) => {
      const { sessionId, error } = data
      const session = this.activeSessions.get(sessionId)
      if (session) {
        session.lastActivityAt = new Date()
        this.io.to(sessionId).emit("sttError", { sessionId, error })
        console.error(`❌ STT error for session ${sessionId}:`, error)
      }
    })

    this.sttService.on("disconnected", (data: STTEventData) => {
      const { sessionId } = data
      console.log(`🎤 STT disconnected for session: ${sessionId}`)
    })

    // Interview Agent Handlers
    this.agent.on("nextQuestion", ({ sessionId, question }) => {
      console.log(`❓ Agent generated next question for ${sessionId}:`, question)

      if (this.ttsEnabled) {
        // Send to TTS first (optional behavior)
        this.ttsService.speak(question, sessionId)
      }

      // Then emit to client (always)
      this.io.to(sessionId).emit("nextQuestion", { sessionId, question })
    })

    this.agent.on("interviewComplete", (data) => {
      console.log(`🏁 Interview completed by agent:`, data)
      this.io.to(data.sessionId).emit("interviewComplete", data)
    })

    if (this.ttsEnabled) {
      this.ttsService.on("audioGenerated", (data) => {
        console.log(`🔊 TTS audio generated for session ${data.sessionId}`)
        this.io.to(data.sessionId).emit("audioGenerated", data)
      })

      this.ttsService.on("audioFinished", (data) => {
        this.io.to(data.sessionId).emit("audioFinished", {
          sessionId: data.sessionId,
          audioUrl: data.audioUrl,
        })
      })

      this.ttsService.on("error", ({ sessionId, error }) => {
        this.io.to(sessionId).emit("error", { sessionId, error })
      })
    } else {
      console.log("🔇 Skipping TTS event registration (TTS disabled)")
    }
  }

  private async generateTTSAudio(sessionId: string, text: string): Promise<void> {
    if (!this.ttsEnabled) {
      console.log(`🔇 [TTS disabled] Skipping audio generation for session: ${sessionId}`)
      return
    }
    try {
      console.log(`🔊 Generating TTS audio for session: ${sessionId}`)
      await this.ttsService.speak(text, sessionId)
    } catch (error) {
      console.error(`❌ Error generating TTS for session ${sessionId}:`, error)
      this.io.to(sessionId).emit("error", "Failed to generate audio")
    }
  }

  private cleanupSession(sessionId: string): void {
    console.log(`🧹 Cleaning up session: ${sessionId}`)
    const session = this.activeSessions.get(sessionId)
    if (session) {
      this.socketToSession.delete(session.socketId)
    }

    this.activeSessions.delete(sessionId)
    this.sttService.finishSession(sessionId)
    this.io.socketsLeave(sessionId)
  }

  start(port: number): void {
    this.server.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`)
      console.log(`🎤 STT Service ready with session isolation`)
      console.log(this.ttsEnabled ? `🔊 TTS Service ready` : `🔇 TTS Service disabled`)
      console.log(`🔌 WebSocket server ready`)
      console.log(`📊 Active sessions: ${this.activeSessions.size}`)
    })
  }

  async stop(): Promise<void> {
    console.log("🛑 Shutting down server...")
    for (const sessionId of this.activeSessions.keys()) {
      this.cleanupSession(sessionId)
    }

    await this.sttService.cleanup()
    this.server.close(() => {
      console.log("✅ Server stopped")
    })
  }
}
