"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const fs_1 = __importDefault(require("fs"));
const sdk_1 = require("@deepgram/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const events_1 = require("events");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
dotenv_1.default.config();
// Add a wav audio container header to the file if you want to play the audio
// using the AudioContext or media player like VLC, Media Player, or Apple Music
// Without this header in the Chrome browser case, the audio will not play.
// prettier-ignore
const wavHeader = [
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x00, 0x00, 0x00, 0x00, // Placeholder for file size
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Chunk size (16)
    0x01, 0x00, // Audio format (1 for PCM)
    0x01, 0x00, // Number of channels (1)
    0x80, 0xBB, 0x00, 0x00, // Sample rate (48000)
    0x00, 0xEE, 0x02, 0x00, // Byte rate (48000 * 2)
    0x02, 0x00, // Block align (2)
    0x10, 0x00, // Bits per sample (16)
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00 // Placeholder for data size
];
class TTSService extends events_1.EventEmitter {
    deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
    outputDir;
    currentSessionId = null;
    constructor() {
        super();
        this.outputDir = path.join(process.cwd(), 'audio_output');
        if (!fs_1.default.existsSync(this.outputDir)) {
            fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    speak = async (text, sessionId) => {
        this.emit('status', { sessionId, message: 'Starting TTS' });
        this.currentSessionId = sessionId;
        try {
            const deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
            const dgConnection = deepgram.speak.live({
                model: "aura-2-thalia-en",
                encoding: "linear16",
                sample_rate: 48000,
            });
            let audioBuffer = Buffer.from(wavHeader);
            dgConnection.on(sdk_1.LiveTTSEvents.Open, () => {
                console.log("Connection opened");
                dgConnection.sendText(text);
                dgConnection.flush();
                dgConnection.on(sdk_1.LiveTTSEvents.Close, () => {
                    console.log("Connection closed");
                });
                dgConnection.on(sdk_1.LiveTTSEvents.Metadata, (data) => {
                    console.dir(data, { depth: null });
                });
                dgConnection.on(sdk_1.LiveTTSEvents.Audio, (data) => {
                    console.log("Deepgram audio data received");
                    // Concatenate the audio chunks into a single buffer
                    const buffer = Buffer.from(data);
                    audioBuffer = Buffer.concat([audioBuffer, buffer]);
                });
                dgConnection.on(sdk_1.LiveTTSEvents.Flushed, () => {
                    console.log("Deepgram Flushed");
                    // Write the buffered audio data to a file when the flush event is received
                    writeFile();
                });
                dgConnection.on(sdk_1.LiveTTSEvents.Error, (err) => {
                    console.error(err);
                });
            });
            const filename = `speech_${sessionId}_${Date.now()}.wav`;
            const filePath = path.join(this.outputDir, filename);
            const audioUrl = `http://localhost:3001/audio/${filename}`;
            const writeFile = () => {
                if (audioBuffer.length > 0) {
                    fs_1.default.writeFile(filePath, audioBuffer, (err) => {
                        if (err) {
                            console.error("Error writing audio file:", err);
                        }
                        else {
                            console.log(`Audio file saved as ${filename}`);
                            console.log('Emitting audioGenerated with URL:', audioUrl);
                            // ✅ Emit audioGenerated after successful write
                            this.emit('audioGenerated', {
                                sessionId,
                                audioUrl,
                                text,
                                duration: this.estimateAudioDuration(audioBuffer.length),
                                timestamp: new Date(),
                            });
                            // ✅ Now play audio AFTER file exists
                            if (process.platform === 'win32') {
                                this.playAudio(filePath, sessionId, audioUrl);
                            }
                            else {
                                setTimeout(() => {
                                    this.emit('audioFinished', { sessionId, audioUrl });
                                }, this.estimateAudioDuration(audioBuffer.length) * 1000);
                            }
                        }
                    });
                    audioBuffer = Buffer.from(wavHeader); // Reset buffer after writing
                }
            };
        }
        catch (err) {
            console.error('TTS Error:', err);
            this.emit('error', {
                sessionId,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    };
    playAudio(filePath, sessionId, audioUrl) {
        console.log(filePath, sessionId, audioUrl);
        const player = (0, child_process_1.spawn)('start', ['', filePath], {
            shell: true,
            detached: true,
            stdio: 'ignore',
        });
        player.on('close', (code) => {
            this.emit('audioFinished', { sessionId, audioUrl, code });
        });
        player.on('error', (err) => {
            console.error('Audio player error:', err);
            this.emit('error', { sessionId, error: `Audio player error: ${err}` });
        });
    }
    estimateAudioDuration(bufferSize) {
        const sampleRate = 24000;
        const bytesPerSample = 2; // 16-bit PCM
        const channels = 1;
        return bufferSize / (sampleRate * bytesPerSample * channels);
    }
    getCurrentSessionId() {
        return this.currentSessionId;
    }
    stop() {
        this.currentSessionId = null;
    }
}
exports.TTSService = TTSService;
//# sourceMappingURL=ttsService.js.map