// src/server/voiceInterviewServer.ts

import express from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { STTService } from '../services/stt/sttService';
import { TTSService } from '../services/tts/ttsService';
import { InterviewAgent } from '../services/interview/interviewAgent';

export class VoiceInterviewServer {
  private app = express();
  private httpServer = createServer(this.app);
  private io = new IOServer(this.httpServer, { cors: { origin: '*' } });
  private stt = new STTService();
  private tts = new TTSService();
  private agent = new InterviewAgent();

  constructor() {
    this.setupSocketHandlers();
    this.app.use(express.static('public'));
    this.app.get('/health', (_, res) => res.json({ status: 'OK' }));
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // 1. Client starts interview
      socket.on('startInterview', ({ techStack, position }) => {
        const sessionId = this.agent.startInterview(techStack, position);
        // @ts-ignore
        socket.join(sessionId);
        socket.emit('interviewStarted', { sessionId });
      });

      // 2. STT emits transcript → forward to agent
      this.stt.on('transcript', ({ sessionId, text, isFinal }) => {
        if (isFinal) this.agent.processAnswer(sessionId, text);
        else this.io.to(sessionId).emit('interimTranscript', text);
      });

      // 3. Agent emits nextQuestion → stop STT and TTS speak
      this.agent.on('nextQuestion', ({ sessionId, question }) => {
        this.stt.stopListening();
        this.tts.speak(question, sessionId);
      });

      // 4. Agent emits interviewComplete → stop STT and TTS speak
      this.agent.on('interviewComplete', ({ sessionId, message }) => {
        this.stt.stopListening();
        this.tts.speak(message, sessionId);
        this.io.to(sessionId).emit('interviewComplete', message);
      });

      // 5. TTS emits audioFinished → start STT listening
      this.tts.on('audioFinished', ({ sessionId }) => {
        this.stt.startListening(sessionId);
      });

      // 6. Error propagation
      [this.stt, this.tts, this.agent].forEach((svc) =>
        svc.on('error', ({ sessionId, error }) => {
          this.io.to(sessionId).emit('error', error);
        })
      );

      // 7. Client disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  start(port: number) {
    this.httpServer.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  }
}
