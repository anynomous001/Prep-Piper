"use strict";
// src/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Load environment variables from .env
const voiceInterviewServer_1 = require("./server/voiceInterviewServer");
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// Bootstrap and start the server
const server = new voiceInterviewServer_1.VoiceInterviewServer();
server.start(PORT);
console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀  Voice Interview Server starting on port ${PORT}...`);
//# sourceMappingURL=index.js.map