"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceInterviewServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const interviewAgent_js_1 = require("../services/interview/interviewAgent.js");
dotenv_1.default.config();
class VoiceInterviewServer {
    app;
    server;
    io;
    agent;
    activeSessions;
    socketToSession;
    constructor() {
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
        this.activeSessions = new Map();
        this.socketToSession = new Map();
        // Initialize Socket.IO with proper CORS
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
            allowEIO3: true,
        });
        // Initialize services
        this.agent = new interviewAgent_js_1.InterviewAgent();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupServiceEvents();
        console.log("✅ VoiceInterviewServer initialized");
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true,
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static("public"));
    }
    setupRoutes() {
        this.app.get("/health", (req, res) => {
            res.json({
                status: "ok",
                timestamp: new Date().toISOString(),
                activeSessions: this.activeSessions.size,
            });
        });
    }
    setupSocketHandlers() {
        this.io.on("connection", (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            socket.on("startInterview", async (data) => {
                try {
                    const sessionId = (0, uuid_1.v4)().substring(0, 8);
                    console.log(`🎯 Starting interview:`, {
                        sessionId,
                        socketId: socket.id,
                        techStack: data.techStack,
                        position: data.position,
                    });
                    const session = {
                        sessionId,
                        socketId: socket.id,
                        createdAt: new Date(),
                        techStack: data.techStack,
                        position: data.position,
                        lastActivityAt: new Date(),
                    };
                    this.activeSessions.set(sessionId, session);
                    this.socketToSession.set(socket.id, sessionId);
                    socket.join(sessionId);
                    // Initialize interview agent with our sessionId
                    const [agentSessionId, question] = this.agent.startInterview(data.techStack, data.position, sessionId);
                    this.io.to(sessionId).emit("interviewStarted", {
                        sessionId,
                        question: { questionText: question },
                    });
                    console.log(`✅ Interview started successfully for session: ${sessionId}`);
                }
                catch (error) {
                    console.error(`❌ Error starting interview:`, error);
                    socket.emit("error", "Failed to start interview");
                }
            });
            // Handle both voice and text transcripts
            socket.on("processTranscript", (data) => {
                const { sessionId, text } = data;
                if (!sessionId || !text) {
                    console.error("❌ Invalid transcript data");
                    return;
                }
                const session = this.activeSessions.get(sessionId);
                if (!session) {
                    console.error(`❌ Invalid session for transcript: ${sessionId}`);
                    return;
                }
                if (session.socketId !== socket.id) {
                    console.error(`❌ Socket ${socket.id} doesn't own session ${sessionId}`);
                    return;
                }
                // Update activity timestamp
                session.lastActivityAt = new Date();
                console.log(`📝 Processing transcript for ${sessionId}:`, text);
                // Process answer through interview agent
                this.agent.processAnswer(sessionId, text.trim());
            });
            // UPDATE: Enhanced endInterview handler with early termination support
            socket.on("endInterview", (data) => {
                const { sessionId, early } = data;
                if (sessionId) {
                    if (early) {
                        // UPDATE: Handle early termination through agent
                        console.log(`🛑 Early interview termination requested for ${sessionId}`);
                        // Let the agent generate contextual termination message
                        const terminationMessage = this.agent.endInterviewEarly(sessionId);
                        // Send the agent's termination message back to client
                        this.io.to(sessionId).emit("interviewComplete", {
                            sessionId,
                            message: terminationMessage,
                            early: true
                        });
                    }
                    else {
                        // Normal completion
                        this.io.to(sessionId).emit("interviewComplete", { sessionId });
                        console.log(`🏁 Interview ${sessionId} completed normally`);
                    }
                    this.cleanupSession(sessionId);
                }
            });
            socket.on("disconnect", (reason) => {
                console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`);
                // Clean up after delay to allow for reconnection
                const sessionId = this.socketToSession.get(socket.id);
                if (sessionId) {
                    setTimeout(() => {
                        const session = this.activeSessions.get(sessionId);
                        if (session && session.socketId === socket.id) {
                            this.cleanupSession(sessionId);
                        }
                    }, 10000);
                }
            });
            socket.on("error", (error) => {
                console.error(`❌ Socket error for ${socket.id}:`, error);
            });
        });
    }
    setupServiceEvents() {
        // Interview Agent Handlers
        this.agent.on("nextQuestion", ({ sessionId, question }) => {
            console.log(`❓ Agent generated next question for ${sessionId}:`, question);
            this.io.to(sessionId).emit("nextQuestion", { sessionId, question });
        });
        this.agent.on("interviewComplete", (data) => {
            console.log(`🏁 Interview completed by agent:`, data);
            this.io.to(data.sessionId).emit("interviewComplete", data);
        });
        // UPDATE: Handle early termination events from agent
        this.agent.on("earlyTermination", (data) => {
            console.log(`🛑 Early termination handled by agent:`, data);
            this.io.to(data.sessionId).emit("interviewComplete", {
                sessionId: data.sessionId,
                message: data.message,
                early: true
            });
        });
    }
    cleanupSession(sessionId) {
        console.log(`🧹 Cleaning up session: ${sessionId}`);
        const session = this.activeSessions.get(sessionId);
        if (session) {
            this.socketToSession.delete(session.socketId);
        }
        this.activeSessions.delete(sessionId);
        this.io.socketsLeave(sessionId);
    }
    start(port) {
        this.server.listen(port, () => {
            console.log(`🚀 Server listening on http://localhost:${port}`);
            console.log(`🔌 WebSocket server ready`);
            console.log(`📊 Active sessions: ${this.activeSessions.size}`);
        });
    }
    async stop() {
        console.log("🛑 Shutting down server...");
        for (const sessionId of this.activeSessions.keys()) {
            this.cleanupSession(sessionId);
        }
        this.server.close(() => {
            console.log("✅ Server stopped");
        });
    }
}
exports.VoiceInterviewServer = VoiceInterviewServer;
//# sourceMappingURL=voiceInterviewServer.js.map