"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.speakText = speakText;
const sdk_1 = require("@deepgram/sdk");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const play_sound_1 = __importDefault(require("play-sound"));
dotenv_1.default.config();
const deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
const audioPlayer = (0, play_sound_1.default)({ player: "powershell" });
async function speakText(text) {
    console.log(`[TTS] Speaking: ${text}`);
    const outFile = path_1.default.join(__dirname, "tts_output.wav");
    // Request TTS from Deepgram
    const response = await deepgram.speak.request({ text }, { model: "aura-asteria-en", encoding: "linear16", container: "wav" });
    const webStream = await response.getStream();
    const fileStream = fs_1.default.createWriteStream(outFile);
    if (!webStream) {
        throw new Error("Failed to get audio stream from Deepgram.");
    }
    // Convert web ReadableStream to Node.js Readable
    const nodeStream = require('stream').Readable.from(webStream);
    await new Promise((resolve, reject) => {
        nodeStream.pipe(fileStream);
        nodeStream.on("end", resolve);
        nodeStream.on("error", reject);
    });
    // Play audio
    await new Promise((resolve, reject) => {
        audioPlayer.play(outFile, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
//# sourceMappingURL=ttsService.js.map