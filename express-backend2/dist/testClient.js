"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const child_process_1 = require("child_process");
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
const TECH_STACK = 'Node.js, TypeScript';
const POSITION = 'Backend Engineer';
// 1. Start interview
socket.on('connect', () => {
    console.log('🟢 Connected to server');
    socket.emit('startInterview', { techStack: TECH_STACK, position: POSITION });
});
// 2. Receive session ID
let sessionId;
socket.on('interviewStarted', ({ sessionId: id, initialMessage }) => {
    sessionId = id;
    console.log('🏁 Interview started, session:', id);
    console.log('🤖 First question:', initialMessage);
    // 3. Play first AI question audio, then start piping prerecorded audio
    socket.on('audioGenerated', ({ filename }) => {
        console.log('🔊 AI question audio saved:', filename);
        // Play it (Windows)
        (0, child_process_1.spawn)('start', ['', filename], { shell: true });
        // After AI finishes, send prerecorded answer into STT
        socket.once('audioFinished', () => {
            console.log('💬 Streaming prerecorded answer...');
            const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
                '-re', '-i', 'test_answer.wav',
                '-f', 's16le', '-ar', '44100', '-ac', '2',
                'pipe:1'
            ], { stdio: ['ignore', 'pipe', 'ignore'] });
            ffmpeg.stdout.on('data', chunk => {
                socket.emit('audioChunk', { sessionId, chunk });
            });
            ffmpeg.on('close', () => {
                console.log('✅ Finished streaming answer audio');
            });
        });
    });
    // 4. Interim transcripts
    socket.on('interimTranscript', (text) => {
        console.log('… interim:', text);
    });
    // 5. Final transcript triggers next cycle
    socket.on('transcript', (text) => {
        console.log('📝 final transcript:', text);
    });
    // 6. When interview completes
    socket.on('interviewComplete', (message) => {
        console.log('🏁 Interview Complete:', message);
        process.exit(0);
    });
    socket.on('error', (err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
});
//# sourceMappingURL=testClient.js.map