"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const events_1 = require("events");
class TTSService extends events_1.EventEmitter {
    currentSessionId = null;
    constructor() {
        super();
        // Intentionally no external dependencies; TTS is disabled by default
    }
    async speak(text, sessionId) {
        // No-op; emit optional informational status if needed
        this.currentSessionId = sessionId;
        this.emit("status", { sessionId, message: "TTS disabled - skipping synthesis" });
        // Do NOT emit audioGenerated since there is no audio.
        // Optionally notify completion without audio so clients can proceed if they rely on this.
        const payload = {
            sessionId,
            audioUrl: null,
            text,
            duration: 0,
            timestamp: new Date(),
        };
        // this.emit('audioGenerated', payload) // skip to avoid downstream audio logic
        this.emit("audioFinished", { sessionId, audioUrl: null });
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