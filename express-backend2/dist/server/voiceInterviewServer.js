"use strict";
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
    io = new socket_io_1.Server(this.httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    stt;
    tts;
    agent;
    constructor() {
        try {
            console.log('🔄 Initializing services...');
            this.stt = new sttService_1.STTService();
            console.log('✅ STT Service initialized');
            this.tts = new ttsService_1.TTSService();
            console.log('✅ TTS Service initialized');
            this.agent = new interviewAgent_1.InterviewAgent();
            console.log('✅ Interview Agent initialized');
            this.setupSocketHandlers();
            this.setupMiddleware();
            this.setupRoutes();
            this.setupServiceEvents();
            console.log('✅ VoiceInterviewServer initialized successfully');
        }
        catch (error) {
            console.error('❌ Error initializing VoiceInterviewServer:', error);
            throw error;
        }
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
        // Serve audio files for frontend
        this.app.use('/audio', express_1.default.static(path_1.default.join(process.cwd(), 'audio_output')));
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            // Frontend starts interview
            socket.on('interviewStarted', async ({ techStack, position }) => {
                try {
                    console.log('Starting interview with:', { techStack, position });
                    // Ensure techStack is a string
                    const techStackStr = Array.isArray(techStack) ? techStack.join(', ') : techStack;
                    const [sessionId, initialMessage] = this.agent.startInterview(techStackStr, position);
                    if (!sessionId) {
                        socket.emit('error', { error: 'Failed to start interview' });
                        return;
                    }
                    //@ts-ignore
                    socket.join(sessionId);
                    //@ts-ignore
                    await this.stt.startListeningForFrontendAudio(sessionId);
                    // socket.emit('interviewStarted', { 
                    //   sessionId,
                    //   question: { questionText: initialMessage }
                    // });
                    console.log('Interview started successfully:', sessionId);
                }
                catch (error) {
                    console.error('Error starting interview:', error);
                    socket.emit('error', { error: error instanceof Error ? error.message : 'Unknown error' });
                }
            });
            // Frontend sends interim transcript
            socket.on('interimTranscript', (data) => {
                socket.broadcast.to(data.sessionId).emit('interimTranscript', data);
            });
            // Frontend sends final transcript  
            socket.on('transcript', (data) => {
                this.agent.processAnswer(data.sessionId, data.text);
            });
            // Frontend sends audio chunks for STT processing
            socket.on('audioChunk', (data) => {
                if (this.stt.processAudioChunk) {
                    this.stt.processAudioChunk(data.sessionId, data.chunk);
                }
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    setupServiceEvents() {
        // Check if all services are initialized
        if (!this.stt || !this.tts || !this.agent) {
            console.error('❌ Services not properly initialized:', {
                stt: !!this.stt,
                tts: !!this.tts,
                agent: !!this.agent
            });
            return;
        }
        console.log('✅ Setting up service events...');
        // STT Service Events
        this.stt.on('connected', ({ sessionId }) => {
            this.io.to(sessionId).emit('sttConnected', { sessionId });
        });
        this.stt.on('audioStopped', ({ sessionId }) => {
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
                audioUrl,
                text,
                duration
            });
        });
        this.tts.on('audioFinished', ({ sessionId }) => {
            this.stt.startListening(sessionId);
            this.io.to(sessionId).emit('audioFinished', { sessionId });
        });
        // Interview Agent Events
        this.agent.on('nextQuestion', ({ sessionId, question, questionNumber, totalQuestions }) => {
            this.stt.stopListening();
            this.tts.speak(question, sessionId);
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
            this.stt.stopListening();
            this.tts.speak(message, sessionId);
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
            console.log("Agent sessionStarted:", sessionId, initialMessage);
            // Emit to frontend so it displays the question
            this.io.to(sessionId).emit('interviewStarted', {
                sessionId,
                question: { questionText: initialMessage }
            });
            this.tts.speak(initialMessage, sessionId);
        });
        // Error handling for all services
        const services = [this.stt, this.tts, this.agent].filter(Boolean);
        services.forEach((service) => {
            service.on('error', ({ sessionId, error }) => {
                console.error(`Service error for session ${sessionId}:`, error);
                this.io.to(sessionId).emit('error', { sessionId, error: error.toString() });
            });
        });
        console.log('✅ Service events setup complete');
    }
    start(port) {
        this.httpServer.listen(port, () => {
            console.log(`🚀 Server listening on http://localhost:${port}`);
        });
    }
}
exports.VoiceInterviewServer = VoiceInterviewServer;
//# sourceMappingURL=voiceInterviewServer.js.map