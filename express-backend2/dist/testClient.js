"use strict";
// test-tts.js
Object.defineProperty(exports, "__esModule", { value: true });
const ttsService_1 = require("./ttsService");
async function test() {
    const tts = new ttsService_1.TTSService();
    await tts.speak("Hello, this is a test message.", "test-session");
}
test().catch(console.error);
//# sourceMappingURL=testClient.js.map