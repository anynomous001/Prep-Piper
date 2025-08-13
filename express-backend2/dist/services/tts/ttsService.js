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
// enhanced-ttsService.ts
const events_1 = require("events");
const sdk_1 = require("@deepgram/sdk");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TTSService extends events_1.EventEmitter {
    deepgram;
    outputDir;
    constructor() {
        super();
        this.deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
        this.outputDir = path.join(process.cwd(), 'audio_output');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async speak(text, sessionId) {
        this.emit('status', { sessionId, message: 'Starting TTS' });
        try {
            const response = await this.deepgram.speak.request({ text }, { model: 'aura-2-thalia-en', encoding: 'linear16', container: 'wav' });
            const stream = await response.getStream();
            if (!stream) {
                throw new Error('No audio stream');
            }
            const buffer = await this.streamToBuffer(stream);
            const filename = path.join(this.outputDir, `speech_${sessionId}_${Date.now()}.wav`);
            fs.writeFileSync(filename, buffer);
            this.emit('audioGenerated', { sessionId, filename, text });
            // Auto-play on Windows
            const player = (0, child_process_1.spawn)('start', ['', filename], { shell: true, detached: true, stdio: 'ignore' });
            player.on('close', () => this.emit('audioFinished', { sessionId, filename }));
            player.on('error', (err) => this.emit('error', { sessionId, error: err }));
        }
        catch (error) {
            this.emit('error', { sessionId, error });
        }
    }
    async streamToBuffer(stream) {
        const reader = stream.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            chunks.push(value);
        }
        const data = Uint8Array.from(chunks.flat());
        return Buffer.from(data.buffer);
    }
}
exports.TTSService = TTSService;
//# sourceMappingURL=ttsService.js.map