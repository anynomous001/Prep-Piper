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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sttService_1 = require("../services/stt/sttService");
const ttsService_1 = require("../services/tts/ttsService");
const interviewAgent_1 = require("../services/interview/interviewAgent");
dotenv_1.default.config();
class VoiceInterviewServer {
    app;
    server;
    io;
    sttService;
    ttsService;
    agent;
    activeSessions;
    socketToSession; // socket.id -> sessionId
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
                credentials: true
            },
            transports: ['websocket', 'polling'],
            allowEIO3: true
        });
        // Initialize services
        this.sttService = new sttService_1.STTService();
        this.ttsService = new ttsService_1.TTSService();
        this.agent = new interviewAgent_1.InterviewAgent();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupServiceEvents();
        // Ensure audio output directory exists
        this.ensureAudioDirectory();
        console.log('✅ VoiceInterviewServer initialized with session isolation');
    }
    ensureAudioDirectory() {
        const audioDir = path_1.default.join(process.cwd(), 'audio_output');
        if (!fs_1.default.existsSync(audioDir)) {
            fs_1.default.mkdirSync(audioDir, { recursive: true });
            console.log('📁 Created audio_output directory');
        }
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
        this.app.use('/audio', express_1.default.static('audio_output'));
    }
    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                activeSessions: this.activeSessions.size,
                activeSTTSessions: this.sttService.getActiveSessionsCount(),
                activeSessionDetails: Array.from(this.activeSessions.values()).map(session => ({
                    sessionId: session.sessionId,
                    socketId: session.socketId,
                    createdAt: session.createdAt,
                    sttActive: this.sttService.isSessionActive(session.sessionId)
                }))
            });
        });
        this.app.get('/session/:sessionId', (req, res) => {
            const { sessionId } = req.params;
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json({
                sessionId: session.sessionId,
                socketId: session.socketId,
                createdAt: session.createdAt,
                sttActive: this.sttService.isSessionActive(sessionId),
                sttInfo: this.sttService.getSessionInfo(sessionId)
            });
        });
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            socket.on('startInterview', async (data) => {
                try {
                    const sessionId = (0, uuid_1.v4)().substring(0, 8);
                    console.log(`🎯 Starting interview:`, {
                        sessionId,
                        socketId: socket.id,
                        techStack: data.techStack,
                        position: data.position
                    });
                    const session = {
                        sessionId,
                        socketId: socket.id,
                        createdAt: new Date(),
                        techStack: data.techStack,
                        position: data.position
                    };
                    this.activeSessions.set(sessionId, session);
                    this.socketToSession.set(socket.id, sessionId);
                    socket.join(sessionId);
                    await this.sttService.startSession(sessionId, socket.id);
                    const question = this.generateInterviewQuestion(data.techStack, data.position);
                    this.io.to(sessionId).emit('interviewStarted', {
                        sessionId,
                        question: { questionText: question }
                    });
                    console.log(`✅ Interview started successfully for session: ${sessionId}`);
                    await this.generateTTSAudio(sessionId, question);
                }
                catch (error) {
                    console.error(`❌ Error starting interview:`, error);
                    socket.emit('error', 'Failed to start interview');
                }
            });
            socket.on('audioChunk', (data) => {
                const { sessionId, audioData } = data;
                if (!sessionId) {
                    console.error('❌ No sessionId provided with audio chunk');
                    return;
                }
                const session = this.activeSessions.get(sessionId);
                if (!session) {
                    console.error(`❌ Invalid session for audio chunk: ${sessionId}`);
                    return;
                }
                if (session.socketId !== socket.id) {
                    console.error(`❌ Socket ${socket.id} doesn't own session ${sessionId}`);
                    return;
                }
                try {
                    const buffer = Buffer.from(audioData);
                    this.sttService.processAudioChunk(sessionId, buffer);
                }
                catch (error) {
                    console.error(`❌ Error processing audio chunk for ${sessionId}:`, error);
                }
            });
            socket.on('finalizeAudio', (data) => {
                const { sessionId } = data;
                if (sessionId && this.activeSessions.has(sessionId)) {
                    this.sttService.finishSession(sessionId);
                }
            });
            socket.on('endInterview', (data) => {
                const { sessionId } = data;
                if (sessionId) {
                    this.cleanupSession(sessionId);
                    this.io.to(sessionId).emit('interviewComplete', { sessionId });
                }
            });
            socket.on('validateSession', (data, callback) => {
                const { sessionId } = data;
                const session = this.activeSessions.get(sessionId);
                callback({ valid: !!session && session.socketId === socket.id });
            });
            socket.on('reestablishSession', (data) => {
                const { sessionId, techStack, position } = data;
                const existingSession = this.activeSessions.get(sessionId);
                if (existingSession) {
                    // Update socket mapping
                    existingSession.socketId = socket.id;
                    this.socketToSession.set(socket.id, sessionId);
                    socket.join(sessionId);
                    console.log(`🔄 Reestablished session ${sessionId} for socket ${socket.id}`);
                    // Notify client
                    socket.emit('sessionReestablished', {
                        sessionId,
                        status: 'active'
                    });
                }
            });
            socket.on('disconnect', (reason) => {
                console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`);
                const sessionId = this.socketToSession.get(socket.id);
                // Don't cleanup session immediately on disconnect
                // Give time for potential reconnection
                if (sessionId) {
                    setTimeout(() => {
                        const session = this.activeSessions.get(sessionId);
                        // Only cleanup if socket hasn't reconnected
                        if (session && session.socketId === socket.id) {
                            this.cleanupSession(sessionId);
                        }
                    }, 5000); // 5 second grace period for reconnection
                }
                this.sttService.cleanupBySocketId(socket.id);
            });
            socket.on('error', (error) => {
                console.error(`❌ Socket error for ${socket.id}:`, error);
            });
        });
    }
    setupServiceEvents() {
        // STT Handlers
        this.sttService.on('connected', (data) => {
            const { sessionId } = data;
            const session = this.activeSessions.get(sessionId);
            if (session) {
                this.io.to(sessionId).emit('sttConnected', { sessionId });
                console.log(`🎤 STT connected for session: ${sessionId}`);
            }
        });
        this.sttService.on('interimTranscript', (data) => {
            const { sessionId, text, confidence } = data;
            const session = this.activeSessions.get(sessionId);
            if (session && text?.trim()) {
                this.io.to(sessionId).emit('interimTranscript', {
                    sessionId,
                    text,
                    confidence,
                    timestamp: new Date()
                });
            }
        });
        this.sttService.on('transcript', (data) => {
            const { sessionId, text, confidence } = data;
            const session = this.activeSessions.get(sessionId);
            if (session && text?.trim()) {
                this.io.to(sessionId).emit('transcript', {
                    sessionId,
                    text,
                    confidence,
                    isFinal: true,
                    timestamp: new Date()
                });
                // Process answer through interview agent
                this.agent.processAnswer(sessionId, text);
                console.log(`📝 Final transcript for ${sessionId}:`, text);
            }
        });
        this.sttService.on('error', (data) => {
            const { sessionId, error } = data;
            const session = this.activeSessions.get(sessionId);
            if (session) {
                this.io.to(sessionId).emit('sttError', { sessionId, error });
                console.error(`❌ STT error for session ${sessionId}:`, error);
            }
        });
        this.sttService.on('disconnected', (data) => {
            const { sessionId } = data;
            console.log(`🎤 STT disconnected for session: ${sessionId}`);
        });
        // Interview Agent Handlers
        this.agent.on('nextQuestion', ({ sessionId, question }) => {
            this.ttsService.speak(question, sessionId);
            this.io.to(sessionId).emit('nextQuestion', { sessionId, question });
        });
        // TTS Handlers
        this.ttsService.on('audioGenerated', (data) => {
            this.io.to(data.sessionId).emit('audioGenerated', data);
        });
        this.ttsService.on('audioFinished', (data) => {
            this.io.to(data.sessionId).emit('audioFinished', {
                sessionId: data.sessionId,
                audioUrl: data.audioUrl
            });
        });
        this.ttsService.on('error', ({ sessionId, error }) => {
            this.io.to(sessionId).emit('error', { sessionId, error });
        });
    }
    generateInterviewQuestion(techStack, position) {
        const greeting = `Hello! I'm Prep Piper, your AI interviewer for today's ${position}. 
    I hope that you are doing well and are ready for this
    interview focusing on ${techStack}. First tell about your experience with ${techStack} and if you 
    have any projects or work samples to share.
    `;
        this.agent.startInterview(techStack, position);
        return greeting;
    }
    async generateTTSAudio(sessionId, text) {
        try {
            console.log(`🔊 Generating TTS audio for session: ${sessionId}`);
            await this.ttsService.speak(text, sessionId);
        }
        catch (error) {
            console.error(`❌ Error generating TTS for session ${sessionId}:`, error);
            this.io.to(sessionId).emit('error', 'Failed to generate audio');
        }
    }
    processTranscriptAndRespond(sessionId, transcript, session) {
        console.log(`🤖 Processing transcript for ${sessionId}: ${transcript}`);
        // The agent will handle this via event handlers we set up in setupServiceEvents
        this.agent.processAnswer(sessionId, transcript);
    }
    cleanupSession(sessionId) {
        console.log(`🧹 Cleaning up session: ${sessionId}`);
        const session = this.activeSessions.get(sessionId);
        if (session) {
            this.socketToSession.delete(session.socketId);
        }
        this.activeSessions.delete(sessionId);
        this.sttService.finishSession(sessionId);
        this.io.socketsLeave(sessionId);
    }
    start(port) {
        this.server.listen(port, () => {
            console.log(`🚀 Server listening on http://localhost:${port}`);
            console.log(`🎤 STT Service ready with session isolation`);
            console.log(`🔊 TTS Service ready`);
            console.log(`🔌 WebSocket server ready`);
            console.log(`📊 Active sessions: ${this.activeSessions.size}`);
        });
    }
    async stop() {
        console.log('🛑 Shutting down server...');
        for (const sessionId of this.activeSessions.keys()) {
            this.cleanupSession(sessionId);
        }
        await this.sttService.cleanup();
        this.server.close(() => {
            console.log('✅ Server stopped');
        });
    }
}
exports.VoiceInterviewServer = VoiceInterviewServer;
//# sourceMappingURL=voiceInterviewServer.js.map