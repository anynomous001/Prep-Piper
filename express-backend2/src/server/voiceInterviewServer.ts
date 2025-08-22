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
  private io = new IOServer(this.httpServer, { 
    cors: {  
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"] 
    } 
  });
  private stt: STTService;
  private tts: TTSService;
  private agent: InterviewAgent;

  constructor() {
    try {
      console.log('🔄 Initializing services...');
      
      this.stt = new STTService();
      console.log('✅ STT Service initialized');
      
      this.tts = new TTSService();
      console.log('✅ TTS Service initialized');
      
      this.agent = new InterviewAgent();
      console.log('✅ Interview Agent initialized');

      this.setupSocketHandlers();
      this.setupMiddleware();
      this.setupRoutes();
      this.setupServiceEvents();
      
      console.log('✅ VoiceInterviewServer initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing VoiceInterviewServer:', error);
      throw error;
    }
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
    
    // Serve audio files for frontend
    this.app.use('/audio', express.static(path.join(process.cwd(), 'audio_output')));
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Frontend starts interview
      socket.on('interviewStarted', async ({ techStack, position }) => {
        try {
          console.log('Starting interview with:', { techStack, position });
          
          // Ensure techStack is a string
          const techStackStr = Array.isArray(techStack) ? techStack.join(', ') : techStack;
          
          const [sessionId, initialMessage] = this.agent.startInterview(techStackStr, position);
          
          if (!sessionId) {
            socket.emit('error', { error: 'Failed to start interview' });
            return;
          }
          
          //@ts-ignore
          socket.join(sessionId);
          
          //@ts-ignore
          await this.stt.startListeningForFrontendAudio(sessionId);

          
          console.log('Interview started successfully:', sessionId);
        } catch (error) {
          console.error('Error starting interview:', error);
          socket.emit('error', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
      });

      // Frontend sends interim transcript
      socket.on('interimTranscript', (data) => {
        socket.broadcast.to(data.sessionId).emit('interimTranscript', data);
      });

      // Frontend sends final transcript  
      socket.on('transcript', (data) => {
        this.agent.processAnswer(data.sessionId, data.text);
      });

      // Frontend sends audio chunks for STT processing
      socket.on('audioChunk', (data) => {
        if (this.stt.processAudioChunk) {
          this.stt.processAudioChunk(data.sessionId, data.chunk);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private setupServiceEvents() {
    // Check if all services are initialized
    if (!this.stt || !this.tts || !this.agent) {
      console.error('❌ Services not properly initialized:', {
        stt: !!this.stt,
        tts: !!this.tts,
        agent: !!this.agent
      });
      return;
    }

    console.log('✅ Setting up service events...');

    // STT Service Events
    this.stt.on('connected', ({ sessionId }) => {
      this.io.to(sessionId).emit('sttConnected', { sessionId });
    });

    this.stt.on('audioStopped', ({ sessionId }) => {
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
        audioUrl,
        text,
        duration
      });
    });

    this.tts.on('audioFinished', ({ sessionId }) => {
      this.stt.startListening(sessionId);
      this.io.to(sessionId).emit('audioFinished', { sessionId });
    });

    this.agent.on('nextQuestion', ({ sessionId, question, questionNumber, totalQuestions }) => {
      this.stt.stopListening();
      this.tts.speak(question, sessionId);
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
      this.stt.stopListening();
      this.tts.speak(message, sessionId);
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
      console.log("Agent sessionStarted:", sessionId, initialMessage);

    this.io.to(sessionId).emit('interviewStarted', {
    
      sessionId,
      question: { questionText: initialMessage }
    });

  console.log("Emitting interviewStarted event:", {
        sessionId,
        question: { questionText: initialMessage }
      }),
      this.tts.speak(initialMessage, sessionId);
    });

    const services = [this.stt, this.tts, this.agent].filter(Boolean);
    
    services.forEach((service) => {
      service.on('error', ({ sessionId, error }) => {
        console.error(`Service error for session ${sessionId}:`, error);
        this.io.to(sessionId).emit('error', { sessionId, error: error.toString() });
      });
    });

    console.log('✅ Service events setup complete');
  }

  start(port: number) {
    this.httpServer.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  }
}
