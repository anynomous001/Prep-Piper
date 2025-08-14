// src/server/voiceInterviewServer.ts

import express from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { STTService } from '../services/stt/sttService';
import { TTSService } from '../services/tts/ttsService';
import { InterviewAgent } from '../services/interview/interviewAgent';

import cors from 'cors';
import apiRoutes from '../routes/api';
import path from 'path';

export class VoiceInterviewServer {
  private app = express();
  private httpServer = createServer(this.app);
  private io = new IOServer(this.httpServer, { cors: {  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"] } });
  private stt = new STTService();
  private tts = new TTSService();
  private agent = new InterviewAgent();

  constructor() {
    this.setupSocketHandlers();
    this.setupMiddleware();
    this.setupRoutes();    
    this.setupServiceEvents(); // 👈 Added this crucial line

  }
   private setupRoutes() {
    this.app.use('/api', apiRoutes);
    this.app.get('/health', (_, res) => res.json({ status: 'OK' }));
  }


private setupMiddleware() {
  this.app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000"
  }));
  this.app.use(express.json());
  this.app.use(express.static('public'));
  
  // 👈 Serve audio files for frontend
  this.app.use('/audio', express.static(path.join(process.cwd(), 'audio_output')));
}


  // private isFrontendAudioMode() {
  //   return process.env.FRONTEND_AUDIO_MODE === 'true';
  // }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

    

     
   // 1. Frontend starts interview
      socket.on('startInterview',async  ({ techStack, position }) => {
        const [sessionId, initialMessage] = this.agent.startInterview(techStack, position);
       //@ts-ignore
        socket.join(sessionId);
//@ts-ignore
          await this.stt.startListeningForFrontendAudio(sessionId);

        socket.emit('interviewStarted', { 
          sessionId,
          question: { questionText: initialMessage }
        });
      });

      // 2. Frontend sends interim transcript
      socket.on('interimTranscript', (data) => {
        socket.broadcast.to(data.sessionId).emit('interimTranscript', data);
      });

      // 3. Frontend sends final transcript  
      socket.on('transcript', (data) => {
        // Forward to agent for processing (agent will emit nextQuestion event)
        this.agent.processAnswer(data.sessionId, data.text);
      });

      // 4. Frontend sends audio chunks for STT processing
      socket.on('audioChunk', (data) => {
        // Forward to STT service (STT will emit transcript events)
        if (this.stt.processAudioChunk) {
          this.stt.processAudioChunk(data.sessionId, data.chunk);
        }
      });

      // 7. Client disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }


   // 👈 This is the crucial part you had that I missed!
  private setupServiceEvents() {
    // STT Service Events
     this.stt.on('connected', ({ sessionId }) => {
    this.io.to(sessionId).emit('sttConnected', { sessionId });
  });

  this.stt.on('audioStopped', ({ sessionId }) => {
    // Notify frontend that STT has stopped
    this.io.to(sessionId).emit('sttStopped', { sessionId });
  });

  this.stt.on('transcript', ({ sessionId, text, isFinal }) => {
    if (isFinal) {
      this.agent.processAnswer(sessionId, text);
      this.io.to(sessionId).emit('transcript', { sessionId, text });
    } else {
      this.io.to(sessionId).emit('interimTranscript', { sessionId, text });
    }
  });

    // TTS Service Events
    this.tts.on('audioGenerated', ({ sessionId, audioUrl, text, duration }) => {
      this.io.to(sessionId).emit('audioGenerated', { 
        sessionId, 
      audioUrl, // 👈 Frontend expects this field
      text,
      duration
      });
    });

    this.tts.on('audioFinished', (sessionId, audioUrl) => {
      // Start listening for next response
      this.stt.startListening(sessionId);
      this.io.to(sessionId).emit('audioFinished', { sessionId });
    });

    // Interview Agent Events
   this.agent.on('nextQuestion', ({ sessionId, question, questionNumber, totalQuestions }) => {
    // Stop current STT listening
    this.stt.stopListening();
    // Generate TTS for the question
    this.tts.speak(question, sessionId);
    // Emit to frontend
    this.io.to(sessionId).emit('nextQuestion', { 
      sessionId, 
      question: { 
        questionText: question,
        questionNumber,
        totalQuestions
      }
    });
  });

   this.agent.on('interviewComplete', ({ sessionId, message, totalQuestions, techStack, position }) => {
    // Stop all services
    this.stt.stopListening();
    this.tts.speak(message, sessionId);
    // Emit to frontend
    this.io.to(sessionId).emit('interviewComplete', { 
      sessionId, 
      message,
      summary: {
        totalQuestions,
        techStack,
        position,
        completedAt: new Date()
      }
    });
  });

    this.agent.on('sessionStarted', ({ sessionId, initialMessage }) => {
      // Generate TTS for first question
      this.tts.speak(initialMessage, sessionId);
    });

    // Error handling for all services
   [this.stt, this.tts, this.agent].forEach((service) => {
    service.on('error', ({ sessionId, error }) => {
      console.error(`Service error for session ${sessionId}:`, error);
      this.io.to(sessionId).emit('error', { sessionId, error: error.toString() });
    });
  });
}

  start(port: number) {
    this.httpServer.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  }
}
