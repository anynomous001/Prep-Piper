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
            this.captureAudio(sessionId);
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
            const text = data.channel.alternatives[0].transcript;
            this.emit('transcript', {
                sessionId,
                text,
                isFinal: data.is_final,
                timestamp: new Date(),
            });
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Close, (closeEvent) => {
            this.emit('disconnected', { sessionId, closeEvent });
            this.cleanup();
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Error, (error) => {
            this.emit('error', { sessionId, error });
            this.cleanup();
        });
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
        this.ffmpegProcess.on('close', (code) => {
            this.emit('audioStopped', { sessionId, code });
            this.cleanup();
        });
        this.ffmpegProcess.on('error', (error) => {
            this.emit('error', { sessionId, error: `FFmpeg error: ${error}` });
            this.cleanup();
        });
    }
    stopListening() {
        this.cleanup();
    }
    cleanup() {
        this.isActive = false;
        if (this.ffmpegProcess) {
            this.ffmpegProcess.kill('SIGTERM');
            this.ffmpegProcess = null;
        }
        if (this.connection) {
            this.connection.finish();
            this.connection = null;
        }
    }
}
exports.STTService = STTService;
//# sourceMappingURL=sttService.js.map