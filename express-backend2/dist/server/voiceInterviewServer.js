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
dotenv_1.default.config();
class VoiceInterviewServer {
    app;
    server;
    io;
    sttService;
    activeSessions = new Map();
    socketToSession = new Map(); // socket.id -> sessionId
    constructor() {
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
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
        // Initialize STT Service
        this.sttService = new sttService_1.STTService();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupSTTHandlers();
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
        // CORS for HTTP requests
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
        // Serve audio files
        this.app.use('/audio', express_1.default.static('audio_output'));
    }
    setupRoutes() {
        // Health check endpoint
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
        // Get session info
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
            // Handle interview start
            socket.on('startInterview', async (data) => {
                try {
                    const sessionId = (0, uuid_1.v4)().substring(0, 8);
                    console.log(`🎯 Starting interview:`, {
                        sessionId,
                        socketId: socket.id,
                        techStack: data.techStack,
                        position: data.position
                    });
                    // Store session info with socket mapping
                    const session = {
                        sessionId,
                        socketId: socket.id,
                        createdAt: new Date(),
                        techStack: data.techStack,
                        position: data.position
                    };
                    this.activeSessions.set(sessionId, session);
                    this.socketToSession.set(socket.id, sessionId);
                    // Join socket to room for this session
                    socket.join(sessionId);
                    console.log(`📍 Socket ${socket.id} joined room ${sessionId}`);
                    // Start STT service for this session with socket ID for tracking
                    await this.sttService.startSession(sessionId, socket.id);
                    // Generate interview question
                    const question = this.generateInterviewQuestion(data.techStack, data.position);
                    // Emit interview started event to the specific session room
                    this.io.to(sessionId).emit('interviewStarted', {
                        sessionId,
                        question: {
                            questionText: question
                        }
                    });
                    console.log(`✅ Interview started successfully for session: ${sessionId}`);
                    // Generate TTS audio for the question
                    setTimeout(() => {
                        this.generateTTSAudio(sessionId, question);
                    }, 1000);
                }
                catch (error) {
                    console.error(`❌ Error starting interview:`, error);
                    socket.emit('error', 'Failed to start interview');
                }
            });
            // Handle audio chunks from frontend
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
                // Verify this socket owns this session
                if (session.socketId !== socket.id) {
                    console.error(`❌ Socket ${socket.id} doesn't own session ${sessionId}`);
                    return;
                }
                // Process audio chunk through STT service
                try {
                    const buffer = Buffer.from(audioData);
                    this.sttService.processAudioChunk(sessionId, buffer);
                }
                catch (error) {
                    console.error(`❌ Error processing audio chunk for ${sessionId}:`, error);
                }
            });
            // Handle finalize audio stream
            socket.on('finalizeAudio', (data) => {
                const { sessionId } = data;
                if (sessionId && this.activeSessions.has(sessionId)) {
                    this.sttService.finishSession(sessionId);
                }
            });
            // Handle interview end
            socket.on('endInterview', (data) => {
                const { sessionId } = data;
                if (sessionId) {
                    this.cleanupSession(sessionId);
                    this.io.to(sessionId).emit('interviewComplete', { sessionId });
                }
            });
            // Handle disconnect
            socket.on('disconnect', (reason) => {
                console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`);
                // Find and cleanup session associated with this socket
                const sessionId = this.socketToSession.get(socket.id);
                if (sessionId) {
                    console.log(`🧹 Cleaning up session ${sessionId} for disconnected socket ${socket.id}`);
                    this.cleanupSession(sessionId);
                }
                // Also cleanup any STT sessions associated with this socket
                this.sttService.cleanupBySocketId(socket.id);
            });
            // Handle errors
            socket.on('error', (error) => {
                console.error(`❌ Socket error for ${socket.id}:`, error);
            });
        });
    }
    setupSTTHandlers() {
        // STT connection established
        this.sttService.on('connected', (data) => {
            const { sessionId } = data;
            const session = this.activeSessions.get(sessionId);
            if (session) {
                this.io.to(sessionId).emit('sttConnected', { sessionId });
                console.log(`🎤 STT connected for session: ${sessionId}`);
            }
        });
        // Interim transcript (real-time)
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
        // Final transcript
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
                console.log(`📝 Final transcript for ${sessionId}:`, text);
                // Process the transcript and generate response
                setTimeout(() => {
                    this.processTranscriptAndRespond(sessionId, text, session);
                }, 1000);
            }
        });
        // STT errors
        this.sttService.on('error', (data) => {
            const { sessionId, error } = data;
            const session = this.activeSessions.get(sessionId);
            if (session) {
                this.io.to(sessionId).emit('sttError', { sessionId, error });
                console.error(`❌ STT error for session ${sessionId}:`, error);
            }
        });
        // STT disconnected
        this.sttService.on('disconnected', (data) => {
            const { sessionId } = data;
            console.log(`🎤 STT disconnected for session: ${sessionId}`);
        });
    }
    generateInterviewQuestion(techStack, position) {
        const questions = [
            `Hello! I'm Prep Piper, your AI interviewer for today's ${position} interview.\n\nI see your tech stack includes: ${techStack}\n\nLet's start with something fundamental. Can you explain what ${techStack} is and describe one project where you've used it effectively?`,
            `Great! Now, can you walk me through a challenging problem you solved using ${techStack}?`,
            `Tell me about a time when you had to optimize performance in a ${techStack} application.`,
            `How do you approach testing in ${techStack} projects?`,
            `What's one thing you'd like to improve about your ${techStack} skills?`
        ];
        return questions[0] ?? "Could not generate a question.";
    }
    async generateTTSAudio(sessionId, text) {
        try {
            console.log(`🔊 Generating TTS audio for session: ${sessionId}`);
            // Mock TTS generation - replace with actual TTS service
            // For now, create a mock audio URL
            const timestamp = Date.now();
            const filename = `speech_${sessionId}_${timestamp}.wav`;
            const audioPath = path_1.default.join(process.cwd(), 'audio_output', filename);
            // Create a mock empty audio file (replace with actual TTS)
            this.createMockAudioFile(audioPath);
            const audioUrl = `http://localhost:${process.env.PORT || 3001}/audio/${filename}`;
            console.log(`🔊 TTS audio generated: ${audioUrl}`);
            // Emit audio generated event
            this.io.to(sessionId).emit('audioGenerated', {
                sessionId,
                audioUrl,
                text: text.substring(0, 100) + '...',
                duration: 3.5
            });
        }
        catch (error) {
            console.error(`❌ Error generating TTS for session ${sessionId}:`, error);
            this.io.to(sessionId).emit('error', 'Failed to generate audio');
        }
    }
    createMockAudioFile(filePath) {
        // Create a minimal WAV file header for a 1-second silent audio
        const sampleRate = 16000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const duration = 1; // 1 second
        const numSamples = sampleRate * duration;
        const dataSize = numSamples * numChannels * (bitsPerSample / 8);
        const fileSize = 44 + dataSize - 8;
        const buffer = Buffer.alloc(44 + dataSize);
        let offset = 0;
        // WAV header
        buffer.write('RIFF', offset);
        offset += 4;
        buffer.writeUInt32LE(fileSize, offset);
        offset += 4;
        buffer.write('WAVE', offset);
        offset += 4;
        buffer.write('fmt ', offset);
        offset += 4;
        buffer.writeUInt32LE(16, offset);
        offset += 4; // PCM format chunk size
        buffer.writeUInt16LE(1, offset);
        offset += 2; // PCM format
        buffer.writeUInt16LE(numChannels, offset);
        offset += 2;
        buffer.writeUInt32LE(sampleRate, offset);
        offset += 4;
        buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), offset);
        offset += 4;
        buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), offset);
        offset += 2;
        buffer.writeUInt16LE(bitsPerSample, offset);
        offset += 2;
        buffer.write('data', offset);
        offset += 4;
        buffer.writeUInt32LE(dataSize, offset);
        offset += 4;
        // Silent audio data (zeros)
        buffer.fill(0, offset);
        fs_1.default.writeFileSync(filePath, buffer);
        console.log(`📁 Mock audio file created: ${filePath}`);
    }
    processTranscriptAndRespond(sessionId, transcript, session) {
        console.log(`🤖 Processing transcript for ${sessionId}: ${transcript}`);
        // Mock AI response generation - replace with actual AI service
        const responses = [
            "Thank you for sharing that. That's a great example of using " + session.techStack + ". Can you tell me more about the challenges you faced during implementation?",
            "Interesting approach! How did you handle error handling and edge cases in that project?",
            "That sounds like solid experience. What would you do differently if you were to rebuild that project today?",
            "Excellent! Can you walk me through your debugging process when you encountered issues?",
            "Great response! Let's move on to the next question."
        ];
        const response = responses[Math.floor(Math.random() * responses.length)] ?? "Thank you for your response. Let's continue.";
        // Generate TTS for the response
        setTimeout(() => {
            this.generateTTSAudio(sessionId, response);
        }, 2000);
    }
    cleanupSession(sessionId) {
        console.log(`🧹 Cleaning up session: ${sessionId}`);
        const session = this.activeSessions.get(sessionId);
        if (session) {
            // Remove socket mapping
            this.socketToSession.delete(session.socketId);
        }
        // Remove from active sessions
        this.activeSessions.delete(sessionId);
        // Cleanup STT session
        this.sttService.finishSession(sessionId);
        // Remove all sockets from the room
        this.io.socketsLeave(sessionId);
    }
    start(port) {
        this.server.listen(port, () => {
            console.log(`🚀 Server listening on http://localhost:${port}`);
            console.log(`🎤 STT Service ready with session isolation`);
            console.log(`🔊 TTS Service ready (mock implementation)`);
            console.log(`🔌 WebSocket server ready`);
            console.log(`📊 Active sessions: ${this.activeSessions.size}`);
        });
    }
    async stop() {
        console.log('🛑 Shutting down server...');
        // Cleanup all sessions
        for (const sessionId of this.activeSessions.keys()) {
            this.cleanupSession(sessionId);
        }
        // Cleanup STT service
        await this.sttService.cleanup();
        // Close server
        this.server.close(() => {
            console.log('✅ Server stopped');
        });
    }
}
exports.VoiceInterviewServer = VoiceInterviewServer;
//# sourceMappingURL=voiceInterviewServer.js.map