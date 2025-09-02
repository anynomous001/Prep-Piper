import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { InterviewAgent } from "../services/interview/interviewAgent.js"

dotenv.config()

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
  private agent: InterviewAgent
  private activeSessions: Map<string, ActiveSession>
  private socketToSession: Map<string, string>

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
    this.agent = new InterviewAgent()

    this.setupMiddleware()
    this.setupRoutes()
    this.setupSocketHandlers()
    this.setupServiceEvents()

    console.log("✅ VoiceInterviewServer initialized")
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
  }

  private setupRoutes(): void {
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        activeSessions: this.activeSessions.size,
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

          // Initialize interview agent with our sessionId
          const [agentSessionId, question] = this.agent.startInterview(
            data.techStack, 
            data.position,
            sessionId
          )

          this.io.to(sessionId).emit("interviewStarted", {
            sessionId,
            question: { questionText: question },
          })

          console.log(`✅ Interview started successfully for session: ${sessionId}`)
        } catch (error) {
          console.error(`❌ Error starting interview:`, error)
          socket.emit("error", "Failed to start interview")
        }
      })

      // Handle both voice and text transcripts
      socket.on("processTranscript", (data) => {
        const { sessionId, text } = data
        if (!sessionId || !text) {
          console.error("❌ Invalid transcript data")
          return
        }

        const session = this.activeSessions.get(sessionId)
        if (!session) {
          console.error(`❌ Invalid session for transcript: ${sessionId}`)
          return
        }

        if (session.socketId !== socket.id) {
          console.error(`❌ Socket ${socket.id} doesn't own session ${sessionId}`)
          return
        }

        // Update activity timestamp
        session.lastActivityAt = new Date()

        console.log(`📝 Processing transcript for ${sessionId}:`, text)

        // Process answer through interview agent
        this.agent.processAnswer(sessionId, text.trim())
      })

      socket.on("endInterview", (data) => {
        const { sessionId } = data
        if (sessionId) {
          this.cleanupSession(sessionId)
          this.io.to(sessionId).emit("interviewComplete", { sessionId })
        }
      })

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`)
        // Clean up after delay to allow for reconnection
        const sessionId = this.socketToSession.get(socket.id)
        if (sessionId) {
          setTimeout(() => {
            const session = this.activeSessions.get(sessionId)
            if (session && session.socketId === socket.id) {
              this.cleanupSession(sessionId)
            }
          }, 10000)
        }
      })

      socket.on("error", (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error)
      })
    })
  }

  private setupServiceEvents(): void {
    // Interview Agent Handlers
    this.agent.on("nextQuestion", ({ sessionId, question }) => {
      console.log(`❓ Agent generated next question for ${sessionId}:`, question)
      this.io.to(sessionId).emit("nextQuestion", { sessionId, question })
    })

    this.agent.on("interviewComplete", (data) => {
      console.log(`🏁 Interview completed by agent:`, data)
      this.io.to(data.sessionId).emit("interviewComplete", data)
    })
  }

  private cleanupSession(sessionId: string): void {
    console.log(`🧹 Cleaning up session: ${sessionId}`)
    const session = this.activeSessions.get(sessionId)
    if (session) {
      this.socketToSession.delete(session.socketId)
    }
    this.activeSessions.delete(sessionId)
    this.io.socketsLeave(sessionId)
  }

  start(port: number): void {
    this.server.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`)
      console.log(`🔌 WebSocket server ready`)
      console.log(`📊 Active sessions: ${this.activeSessions.size}`)
    })
  }

  async stop(): Promise<void> {
    console.log("🛑 Shutting down server...")
    for (const sessionId of this.activeSessions.keys()) {
      this.cleanupSession(sessionId)
    }
    this.server.close(() => {
      console.log("✅ Server stopped")
    })
  }
}
