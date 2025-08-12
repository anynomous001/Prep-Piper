"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@deepgram/sdk");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// STEP 1: Create a Deepgram client with your API key
const deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
const text = "Hello, how can I help you today?";
const getAudio = async () => {
    // STEP 2: Make a request and configure the request with options (such as model choice, audio configuration, etc.)
    const response = await deepgram.speak.request({ text }, {
        model: "aura-2-thalia-en",
        encoding: "linear16",
        container: "wav",
    });
    // STEP 3: Get the audio stream and headers from the response
    const stream = await response.getStream();
    const headers = await response.getHeaders();
    if (stream) {
        // STEP 4: Convert the stream to an audio buffer
        const buffer = await getAudioBuffer(stream);
        // STEP 5: Write the audio buffer to a file
        fs_1.default.writeFile("output.wav", buffer, (err) => {
            if (err) {
                console.error("Error writing audio to file:", err);
            }
            else {
                console.log("Audio file written to output.wav");
            }
        });
    }
    else {
        console.error("Error generating audio:", stream);
    }
    if (headers) {
        console.log("Headers:", headers);
    }
};
// helper function to convert stream to audio buffer
//@ts-ignore
const getAudioBuffer = async (response) => {
    const reader = response.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        chunks.push(value);
    }
    const dataArray = chunks.reduce((acc, chunk) => Uint8Array.from([...acc, ...chunk]), new Uint8Array(0));
    return Buffer.from(dataArray.buffer);
};
getAudio();
//# sourceMappingURL=ttsService.js.map