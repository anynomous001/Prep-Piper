"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STTService = void 0;
// enhanced-sttService.ts
const events_1 = require("events");
const sdk_1 = require("@deepgram/sdk");
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class STTService extends events_1.EventEmitter {
    deepgram;
    connection = null;
    ffmpegProcess = null;
    isActive = false;
    currentSessionId = null;
    constructor() {
        super();
        this.deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
    }
    async startListening(sessionId) {
        if (this.isActive) {
            this.emit('error', { sessionId, error: 'STT already active' });
            return;
        }
        this.isActive = true;
        this.currentSessionId = sessionId; // 👈 Set current session
        this.emit('status', { sessionId, message: 'Starting STT service' });
        // 1. Open Deepgram live transcription
        this.connection = this.deepgram.listen.live({
            model: 'nova-2',
            language: 'en-US',
            smart_format: true,
            interim_results: true,
            encoding: 'linear16',
            sample_rate: 44100,
            channels: 2,
            endpointing: 300,
            utterance_end_ms: 1500,
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Open, () => {
            this.emit('connected', { sessionId });
            // Only start FFmpeg capture if we're not using frontend audio chunks
            if (!this.isFrontendAudioMode()) {
                this.captureAudio(sessionId);
            }
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
            const text = data.channel.alternatives[0].transcript;
            this.emit('transcript', {
                sessionId,
                text,
                confidence: data.channel.alternatives[0].confidence,
                isFinal: data.is_final,
                timestamp: new Date(),
            });
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Close, (closeEvent) => {
            this.emit('disconnected', { sessionId, closeEvent });
            this.cleanup();
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Error, (error) => {
            console.error('Deepgram STT Error:', error);
            this.emit('error', { sessionId, error: `Deepgram STT Error: ${error}` });
            this.cleanup();
        });
    }
    // NEW: Handle audio chunks from frontend
    processAudioChunk(sessionId, chunk) {
        if (!this.connection || this.connection.getReadyState() !== 1) {
            console.warn('STT connection not ready for audio chunk');
            return;
        }
        if (!this.isActive || this.currentSessionId !== sessionId) {
            console.warn('STT not active for this session');
            return;
        }
        try {
            // Convert ArrayBuffer to Buffer if needed
            let buffer;
            if (chunk instanceof ArrayBuffer) {
                buffer = Buffer.from(chunk);
            }
            else {
                buffer = chunk;
            }
            // Send audio data to Deepgram
            this.connection.send(buffer);
        }
        catch (error) {
            console.error('Error processing audio chunk:', error);
            this.emit('error', {
                sessionId,
                error: `Audio chunk processing error: ${error}`
            });
        }
    }
    // NEW: Start listening without FFmpeg (for frontend audio)
    async startListeningForFrontendAudio(sessionId) {
        console.log('Starting STT for frontend audio mode');
        await this.startListening(sessionId);
    }
    // NEW: Finalize audio stream from frontend
    finalizeAudioStream(sessionId) {
        if (this.connection && this.currentSessionId === sessionId) {
            // Send end-of-stream signal to Deepgram
            try {
                this.connection.finish();
            }
            catch (error) {
                console.error('Error finalizing audio stream:', error);
            }
        }
    }
    captureAudio(sessionId) {
        const ffmpegArgs = [
            '-f', 'dshow',
            '-i', 'audio=Microphone (Realtek(R) Audio)',
            '-f', 's16le',
            '-acodec', 'pcm_s16le',
            '-ar', '44100',
            '-ac', '2',
            'pipe:1',
        ];
        this.ffmpegProcess = (0, child_process_1.spawn)('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
        this.ffmpegProcess.stdout.on('data', (chunk) => {
            if (this.connection.getReadyState() === 1) {
                this.connection.send(chunk);
            }
        });
        this.ffmpegProcess.stderr.on('data', (data) => {
            console.log('FFmpeg stderr:', data.toString());
        });
        this.ffmpegProcess.on('close', (code) => {
            console.log('FFmpeg process closed with code:', code);
            this.emit('audioStopped', { sessionId, code });
            this.cleanup();
        });
        this.ffmpegProcess.on('error', (error) => {
            console.error('FFmpeg error:', error);
            this.emit('error', { sessionId, error: `FFmpeg error: ${error}` });
            this.cleanup();
        });
    }
    stopListening() {
        console.log('Stopping STT service');
        this.cleanup();
    }
    // NEW: Check if we're in frontend audio mode
    isFrontendAudioMode() {
        // You can add logic here to determine audio source mode
        // For now, assume frontend audio if no specific server-side config
        return process.env.AUDIO_SOURCE !== 'server';
    }
    cleanup() {
        this.isActive = false;
        this.currentSessionId = null;
        if (this.ffmpegProcess) {
            try {
                this.ffmpegProcess.kill('SIGTERM');
                setTimeout(() => {
                    if (this.ffmpegProcess) {
                        this.ffmpegProcess.kill('SIGKILL');
                    }
                }, 5000);
            }
            catch (error) {
                console.error('Error killing FFmpeg process:', error);
            }
            this.ffmpegProcess = null;
        }
        if (this.connection) {
            try {
                this.connection.finish();
            }
            catch (error) {
                console.error('Error closing Deepgram connection:', error);
            }
            this.connection = null;
        }
        this.emit('stopped');
    }
    // NEW: Get connection status
    isConnected() {
        return this.connection && this.connection.getReadyState() === 1;
    }
    // NEW: Get active session
    getCurrentSessionId() {
        return this.currentSessionId;
    }
    // NEW: Restart connection if needed
    async restartConnection(sessionId) {
        if (this.isActive) {
            this.cleanup();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await this.startListening(sessionId);
    }
}
exports.STTService = STTService;
//# sourceMappingURL=sttService.js.map