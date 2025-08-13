// src/index.ts

import 'dotenv/config';  // Load environment variables from .env
import { VoiceInterviewServer } from './server/voiceInterviewServer';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Bootstrap and start the server
const server = new VoiceInterviewServer();
server.start(PORT);

console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀  Voice Interview Server starting on port ${PORT}...`);
