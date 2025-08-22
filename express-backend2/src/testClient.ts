// test-tts.js

import { TTSService } from "./ttsService";

async function test() {
  const tts = new TTSService();
  await tts.speak("Hello, this is a test message.", "test-session");
}

test().catch(console.error);
