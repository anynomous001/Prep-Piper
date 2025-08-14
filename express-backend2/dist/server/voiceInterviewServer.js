"use strict";
// src/server/voiceInterviewServer.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceInterviewServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const sttService_1 = require("../services/stt/sttService");
const ttsService_1 = require("../services/tts/ttsService");
const interviewAgent_1 = require("../services/interview/interviewAgent");
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../routes/api"));
const path_1 = __importDefault(require("path"));
class VoiceInterviewServer {
    app = (0, express_1.default)();
    httpServer = (0, http_1.createServer)(this.app);
    io = new socket_io_1.Server(this.httpServer, { cors: { origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"] } });
    stt = new sttService_1.STTService();
    tts = new ttsService_1.TTSService();
    agent = new interviewAgent_1.InterviewAgent();
    constructor() {
        this.setupSocketHandlers();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupServiceEvents(); // 👈 Added this crucial line
    }
    setupRoutes() {
        this.app.use('/api', api_1.default);
        this.app.get('/health', (_, res) => res.json({ status: 'OK' }));
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN || "http://localhost:3000"
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
        // 👈 Serve audio files for frontend
        this.app.use('/audio', express_1.default.static(path_1.default.join(process.cwd(), 'audio_output')));
    }
    // private isFrontendAudioMode() {
    //   return process.env.FRONTEND_AUDIO_MODE === 'true';
    // }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            // 1. Frontend starts interview
            socket.on('startInterview', async ({ techStack, position }) => {
                const [sessionId, initialMessage] = this.agent.startInterview(techStack, position);
                //@ts-ignore
                socket.join(sessionId);
                //@ts-ignore
                await this.stt.startListeningForFrontendAudio(sessionId);
                socket.emit('interviewStarted', {
                    sessionId,
                    question: { questionText: initialMessage }
                });
            });
            // 2. Frontend sends interim transcript
            socket.on('interimTranscript', (data) => {
                socket.broadcast.to(data.sessionId).emit('interimTranscript', data);
            });
            // 3. Frontend sends final transcript  
            socket.on('transcript', (data) => {
                // Forward to agent for processing (agent will emit nextQuestion event)
                this.agent.processAnswer(data.sessionId, data.text);
            });
            // 4. Frontend sends audio chunks for STT processing
            socket.on('audioChunk', (data) => {
                // Forward to STT service (STT will emit transcript events)
                if (this.stt.processAudioChunk) {
                    this.stt.processAudioChunk(data.sessionId, data.chunk);
                }
            });
            // 7. Client disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    // 👈 This is the crucial part you had that I missed!
    setupServiceEvents() {
        // STT Service Events
        this.stt.on('connected', ({ sessionId }) => {
            this.io.to(sessionId).emit('sttConnected', { sessionId });
        });
        this.stt.on('audioStopped', ({ sessionId }) => {
            // Notify frontend that STT has stopped
            this.io.to(sessionId).emit('sttStopped', { sessionId });
        });
        this.stt.on('transcript', ({ sessionId, text, isFinal }) => {
            if (isFinal) {
                this.agent.processAnswer(sessionId, text);
                this.io.to(sessionId).emit('transcript', { sessionId, text });
            }
            else {
                this.io.to(sessionId).emit('interimTranscript', { sessionId, text });
            }
        });
        // TTS Service Events
        this.tts.on('audioGenerated', ({ sessionId, audioUrl, text, duration }) => {
            this.io.to(sessionId).emit('audioGenerated', {
                sessionId,
                audioUrl, // 👈 Frontend expects this field
                text,
                duration
            });
        });
        this.tts.on('audioFinished', (sessionId, audioUrl) => {
            // Start listening for next response
            this.stt.startListening(sessionId);
            this.io.to(sessionId).emit('audioFinished', { sessionId });
        });
        // Interview Agent Events
        this.agent.on('nextQuestion', ({ sessionId, question, questionNumber, totalQuestions }) => {
            // Stop current STT listening
            this.stt.stopListening();
            // Generate TTS for the question
            this.tts.speak(question, sessionId);
            // Emit to frontend
            this.io.to(sessionId).emit('nextQuestion', {
                sessionId,
                question: {
                    questionText: question,
                    questionNumber,
                    totalQuestions
                }
            });
        });
        this.agent.on('interviewComplete', ({ sessionId, message, totalQuestions, techStack, position }) => {
            // Stop all services
            this.stt.stopListening();
            this.tts.speak(message, sessionId);
            // Emit to frontend
            this.io.to(sessionId).emit('interviewComplete', {
                sessionId,
                message,
                summary: {
                    totalQuestions,
                    techStack,
                    position,
                    completedAt: new Date()
                }
            });
        });
        this.agent.on('sessionStarted', ({ sessionId, initialMessage }) => {
            // Generate TTS for first question
            this.tts.speak(initialMessage, sessionId);
        });
        // Error handling for all services
        [this.stt, this.tts, this.agent].forEach((service) => {
            service.on('error', ({ sessionId, error }) => {
                console.error(`Service error for session ${sessionId}:`, error);
                this.io.to(sessionId).emit('error', { sessionId, error: error.toString() });
            });
        });
    }
    start(port) {
        this.httpServer.listen(port, () => {
            console.log(`🚀 Server listening on http://localhost:${port}`);
        });
    }
}
exports.VoiceInterviewServer = VoiceInterviewServer;
//# sourceMappingURL=voiceInterviewServer.js.map