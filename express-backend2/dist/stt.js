"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.DEEPGRAM_API_KEY;
if (!apiKey) {
    console.error("❌ Missing DEEPGRAM_API_KEY in .env");
    process.exit(1);
}
// Detect audio device per OS
function getAudioDevice() {
    const platform = process.platform;
    if (platform === "win32") {
        try {
            const output = (0, child_process_1.execSync)(`ffmpeg -list_devices true -f dshow -i dummy`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
            const stereoMix = output.match(/"Stereo Mix \(Realtek\(R\) Audio\)"/);
            const deviceName = stereoMix
                ? stereoMix[0].replace(/"/g, "")
                : "Microphone (Realtek(R) Audio)";
            return {
                name: deviceName,
                ffmpegArgs: [
                    "-f", "dshow",
                    "-i", `audio=${deviceName}`,
                    "-ac", "1",
                    "-ar", "16000",
                    "-f", "s16le",
                    "pipe:1",
                ],
            };
        }
        catch {
            console.error("❌ Failed to list devices. Ensure FFmpeg is in PATH.");
            process.exit(1);
        }
    }
    if (platform === "darwin") {
        // Default to device index 0 on macOS (mic)
        return {
            name: "default macOS mic (device index 0)",
            ffmpegArgs: [
                "-f", "avfoundation",
                "-i", ":0", // audio only
                "-ac", "1",
                "-ar", "16000",
                "-f", "s16le",
                "pipe:1",
            ],
        };
    }
    // Linux (PulseAudio default)
    return {
        name: "default Linux mic (PulseAudio)",
        ffmpegArgs: [
            "-f", "pulse",
            "-i", "default",
            "-ac", "1",
            "-ar", "16000",
            "-f", "s16le",
            "pipe:1",
        ],
    };
}
const ws = new ws_1.default("wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000", {
    headers: { Authorization: `Token ${apiKey}` },
});
ws.on("open", () => {
    const { ffmpegArgs, name } = getAudioDevice();
    console.log(`🎙 Using audio device: ${name}`);
    const ffmpeg = (0, child_process_1.spawn)("ffmpeg", ffmpegArgs, { stdio: ["ignore", "pipe", "inherit"] });
    ffmpeg.stdout.on("data", (chunk) => {
        if (ws.readyState === ws_1.default.OPEN) {
            ws.send(chunk);
        }
    });
    ffmpeg.on("close", () => {
        console.log("FFmpeg process ended.");
        closeWS();
    });
});
ws.on("message", (data) => {
    try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "Results") {
            const transcript = msg.channel.alternatives[0].transcript;
            if (transcript) {
                console.log("Transcript:", transcript);
            }
        }
    }
    catch (err) {
        console.error("Failed to parse message:", err);
    }
});
ws.on("close", () => console.log("🔒 Deepgram connection closed."));
ws.on("error", (err) => console.error("WebSocket error:", err.message));
function closeWS() {
    if (ws.readyState === ws_1.default.OPEN) {
        ws.send(JSON.stringify({ type: "CloseStream" }));
        ws.close();
    }
}
process.on("SIGINT", () => {
    console.log("\nStopping...");
    closeWS();
    process.exit(0);
});
//# sourceMappingURL=stt.js.map