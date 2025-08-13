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
class VoiceInterviewServer {
    app = (0, express_1.default)();
    httpServer = (0, http_1.createServer)(this.app);
    io = new socket_io_1.Server(this.httpServer, { cors: { origin: '*' } });
    stt = new sttService_1.STTService();
    tts = new ttsService_1.TTSService();
    agent = new interviewAgent_1.InterviewAgent();
    constructor() {
        this.setupSocketHandlers();
        this.app.use(express_1.default.static('public'));
        this.app.get('/health', (_, res) => res.json({ status: 'OK' }));
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            // 1. Client starts interview
            socket.on('startInterview', ({ techStack, position }) => {
                const sessionId = this.agent.startInterview(techStack, position);
                // @ts-ignore
                socket.join(sessionId);
                socket.emit('interviewStarted', { sessionId });
            });
            // 2. STT emits transcript → forward to agent
            this.stt.on('transcript', ({ sessionId, text, isFinal }) => {
                if (isFinal)
                    this.agent.processAnswer(sessionId, text);
                else
                    this.io.to(sessionId).emit('interimTranscript', text);
            });
            // 3. Agent emits nextQuestion → stop STT and TTS speak
            this.agent.on('nextQuestion', ({ sessionId, question }) => {
                this.stt.stopListening();
                this.tts.speak(question, sessionId);
            });
            // 4. Agent emits interviewComplete → stop STT and TTS speak
            this.agent.on('interviewComplete', ({ sessionId, message }) => {
                this.stt.stopListening();
                this.tts.speak(message, sessionId);
                this.io.to(sessionId).emit('interviewComplete', message);
            });
            // 5. TTS emits audioFinished → start STT listening
            this.tts.on('audioFinished', ({ sessionId }) => {
                this.stt.startListening(sessionId);
            });
            // 6. Error propagation
            [this.stt, this.tts, this.agent].forEach((svc) => svc.on('error', ({ sessionId, error }) => {
                this.io.to(sessionId).emit('error', error);
            }));
            // 7. Client disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
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