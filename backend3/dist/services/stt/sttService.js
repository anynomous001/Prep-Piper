"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STTService = void 0;
const events_1 = require("events");
const sdk_1 = require("@deepgram/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class STTService extends events_1.EventEmitter {
    deepgram;
    sessions = new Map();
    cleanupInterval;
    constructor() {
        super();
        this.deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
        console.log("✅ STTService initialized with session isolation");
        // Setup cleanup interval to remove stale sessions
        this.cleanupInterval = setInterval(() => {
            this.cleanupStaleSessions();
        }, 30000); // Check every 30 seconds
    }
    cleanupStaleSessions() {
        const now = new Date();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes
        for (const [sessionId, session] of this.sessions) {
            if (now.getTime() - session.lastActivityAt.getTime() > staleThreshold) {
                console.log(`🧹 Cleaning up stale session: ${sessionId}`);
                this.cleanupSession(sessionId);
            }
        }
    }
    async startSession(sessionId, socketId) {
        console.log(`🎤 Starting STT session: ${sessionId}`);
        // Check if session already exists and is active
        const existingSession = this.sessions.get(sessionId);
        if (existingSession?.isActive) {
            console.warn(`⚠️ STT session ${sessionId} already active, updating activity time`);
            existingSession.lastActivityAt = new Date();
            this.emit("connected", { sessionId });
            return;
        }
        // Clean up any inactive session with the same ID
        if (existingSession && !existingSession.isActive) {
            await this.cleanupSession(sessionId);
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
                utterance_end_ms: 2000, // Increased to 2 seconds
                vad_events: true, // Enable voice activity detection
                punctuate: true,
                profanity_filter: false,
                redact: false,
            });
            // Create session object
            const session = {
                sessionId,
                connection,
                isActive: false,
                createdAt: new Date(),
                socketId: socketId || null,
                lastActivityAt: new Date(),
            };
            // Set up connection event handlers
            connection.on(sdk_1.LiveTranscriptionEvents.Open, () => {
                console.log(`🎤 Deepgram connection opened for session: ${sessionId}`);
                session.isActive = true;
                session.lastActivityAt = new Date();
                this.emit("connected", { sessionId });
            });
            connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
                session.lastActivityAt = new Date();
                if (data.channel?.alternatives?.[0]?.transcript?.trim()) {
                    const transcript = {
                        sessionId,
                        text: data.channel.alternatives[0].transcript,
                        confidence: data.channel.alternatives[0].confidence,
                        isFinal: data.is_final,
                        timestamp: new Date(),
                    };
                    if (data.is_final) {
                        console.log(`📝 Final transcript for ${sessionId}:`, transcript.text);
                        this.emit("transcript", transcript);
                        console.log(`✅ [STTService] final transcript: "${transcript.text}" for ${sessionId}`);
                    }
                    else {
                        this.emit("interimTranscript", transcript);
                    }
                }
            });
            connection.on(sdk_1.LiveTranscriptionEvents.UtteranceEnd, (data) => {
                console.log(`🎤 Utterance ended for session ${sessionId}`);
                session.lastActivityAt = new Date();
                // Don't auto-cleanup on utterance end, let the client decide
            });
            connection.on(sdk_1.LiveTranscriptionEvents.Close, (closeEvent) => {
                console.log(`🎤 Deepgram connection closed for session: ${sessionId}`, closeEvent);
                this.emit("disconnected", { sessionId, closeEvent });
                // session.isActive = false
            });
            connection.on(sdk_1.LiveTranscriptionEvents.Error, (error) => {
                console.error(`❌ Deepgram error for session ${sessionId}:`, error);
                this.emit("error", { sessionId, error: error.message });
                session.isActive = false;
            });
            // Store the session
            this.sessions.set(sessionId, session);
            console.log(`✅ STT session ${sessionId} started successfully`);
            // Emit state change event
            this.emit("stateChange", { sessionId, state: "ready" });
        }
        catch (error) {
            console.error(`❌ Failed to start STT session ${sessionId}:`, error);
            this.emit("error", {
                sessionId,
                error: error instanceof Error ? error.message : "Failed to start STT session",
            });
            this.emit("stateChange", { sessionId, state: "error" });
            this.cleanupSession(sessionId);
        }
    }
    processAudioChunk(sessionId, audioData) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.warn(`⚠️ No STT session found for: ${sessionId}`);
            return;
        }
        if (!session.isActive) {
            console.warn(`⚠️ STT session ${sessionId} is not active`);
            return;
        }
        if (!session.connection || session.connection.getReadyState() !== 1) {
            console.warn(`⚠️ STT connection not ready for session: ${sessionId}`);
            return;
        }
        try {
            // Convert ArrayBuffer to Buffer if needed
            const buffer = audioData instanceof ArrayBuffer ? Buffer.from(audioData) : audioData;
            // Update activity timestamp
            session.lastActivityAt = new Date();
            // Send audio data to Deepgram
            session.connection.send(buffer);
        }
        catch (error) {
            console.error(`❌ Error processing audio chunk for session ${sessionId}:`, error);
            this.emit("error", {
                sessionId,
                error: `Audio processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        }
    }
    finishSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.warn(`⚠️ No STT session to finish: ${sessionId}`);
            return;
        }
        console.log(`🛑 Finishing STT session: ${sessionId}`);
        try {
            if (session.connection && session.isActive) {
                // Send a final message to indicate end of speech
                console.log(`🛑 [STTService] finishSession() called for ${sessionId}`);
                session.connection.finish();
            }
        }
        catch (error) {
            console.error(`❌ Error finishing session ${sessionId}:`, error);
        }
        finally {
            // Don't immediately cleanup, give some time for final transcripts
            setTimeout(() => {
                this.cleanupSession(sessionId);
            }, 2000); // Wait 2 seconds before cleanup
        }
    }
    // Clean up session by socket ID (when client disconnects)
    cleanupBySocketId(socketId) {
        console.log(`🧹 Cleaning up sessions for socket: ${socketId}`);
        const sessionsToCleanup = [];
        for (const [sessionId, session] of this.sessions) {
            if (session.socketId === socketId) {
                sessionsToCleanup.push(sessionId);
            }
        }
        for (const sessionId of sessionsToCleanup) {
            this.finishSession(sessionId);
        }
    }
    async cleanupSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }
        console.log(`🧹 Cleaning up STT session: ${sessionId}`);
        try {
            session.isActive = false;
            if (session.connection) {
                session.connection.removeAllListeners();
                try {
                    if (session.connection.getReadyState() === 1) {
                        session.connection.finish();
                    }
                }
                catch (error) {
                    console.error(`❌ Error closing connection for session ${sessionId}:`, error);
                }
            }
            this.sessions.delete(sessionId);
            this.emit("sessionCleaned", { sessionId });
        }
        catch (error) {
            console.error(`❌ Error during cleanup for session ${sessionId}:`, error);
        }
    }
    getActiveSessionsCount() {
        return Array.from(this.sessions.values()).filter((session) => session.isActive).length;
    }
    getSessionInfo(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    isSessionActive(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? session.isActive : false;
    }
    getAllActiveSessions() {
        return Array.from(this.sessions.entries())
            .filter(([_, session]) => session.isActive)
            .map(([sessionId, _]) => sessionId);
    }
    async cleanup() {
        console.log("🧹 Cleaning up all STT sessions");
        // Clear cleanup interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        const sessionIds = Array.from(this.sessions.keys());
        for (const sessionId of sessionIds) {
            await this.cleanupSession(sessionId);
        }
        this.sessions.clear();
        console.log("✅ All STT sessions cleaned up");
    }
}
exports.STTService = STTService;
//# sourceMappingURL=sttService.js.map