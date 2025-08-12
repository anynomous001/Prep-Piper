"use strict";
// Example filename: index.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@deepgram/sdk");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// URL for the realtime streaming audio you would like to transcribe
const url = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";
const live = async () => {
    // STEP 1: Create a Deepgram client using the API key
    const deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
    // STEP 2: Create a live transcription connection
    const connection = deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        smart_format: true,
    });
    // STEP 3: Listen for events from the live transcription connection
    connection.on(sdk_1.LiveTranscriptionEvents.Open, () => {
        connection.on(sdk_1.LiveTranscriptionEvents.Close, () => {
            console.log("Connection closed.");
        });
        connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
            console.log(data.channel.alternatives[0].transcript);
        });
        connection.on(sdk_1.LiveTranscriptionEvents.Metadata, (data) => {
            console.log(data);
        });
        connection.on(sdk_1.LiveTranscriptionEvents.Error, (err) => {
            console.error(err);
        });
        // STEP 4: Fetch the audio stream and send it to the live transcription connection
        (0, cross_fetch_1.default)(url)
            .then((r) => r.body)
            .then((res) => {
            if (!res) {
                console.error("No response body");
                return;
            }
            // 'res' is already a Node.js Readable stream
            const nodeRes = res;
            nodeRes.on("data", (chunk) => {
                // Convert Buffer to Uint8Array for compatibility
                const uint8 = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
                // @ts-ignore
                connection.send(uint8);
            });
            nodeRes.on("end", () => {
                connection.finish();
            });
        });
    });
};
live();
//# sourceMappingURL=stt2.js.map