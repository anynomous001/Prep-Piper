"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenAndTranscribe = listenAndTranscribe;
const sdk_1 = require("@deepgram/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const mic_1 = __importDefault(require("mic"));
dotenv_1.default.config();
const deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
async function listenAndTranscribe() {
    console.log("[STT] Listening for candidate answer...");
    return new Promise(async (resolve, reject) => {
        let transcript = "";
        let lastSpeechTime = Date.now();
        // Allow device selection via environment variable
        const micDevice = process.env.MIC_DEVICE || "Microphone (Realtek(R) Audio)";
        console.log(`[MIC] Using device: ${micDevice}`);
        const micInstance = (0, mic_1.default)({
            rate: "16000",
            channels: "1",
            debug: true, // Enable debug logs
            exitOnSilence: 6,
            device: micDevice
        });
        const micInputStream = micInstance.getAudioStream();
        // Connect to Deepgram live transcription
        const connection = deepgram.listen.live({ punctuate: true, interim_results: false });
        connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (dgMessage) => {
            const text = dgMessage.channel.alternatives[0].transcript;
            if (text && text.trim() !== "") {
                transcript = text;
                lastSpeechTime = Date.now();
                console.log(`[STT Partial]: ${text}`);
            }
        });
        connection.on(sdk_1.LiveTranscriptionEvents.Close, () => {
            console.log("[STT] Connection closed.");
            resolve(transcript);
        });
        micInputStream.on("data", (data) => {
            console.log(`[MIC] Data chunk received: ${data.length} bytes`);
            // Convert Buffer to Uint8Array for Deepgram
            const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
            //@ts-ignore
            connection.send(uint8);
            // Stop if silence > 2 seconds
            if (Date.now() - lastSpeechTime > 2000 && transcript.length > 0) {
                micInstance.stop();
                connection.finish();
            }
        });
        micInputStream.on("error", (err) => reject(err));
        micInstance.start();
    });
}
//# sourceMappingURL=sstService.js.map