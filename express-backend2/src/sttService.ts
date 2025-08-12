// enhanced-sttService.ts
import { EventEmitter } from 'events';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

export class STTService extends EventEmitter {
  private deepgram: ReturnType<typeof createClient>;
  private connection: any = null;
  private ffmpegProcess: any = null;
  private isActive = false;

  constructor() {
    super();
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  }

  async startListening(sessionId: string) {
    if (this.isActive) {
      this.emit('error', { sessionId, error: 'STT already active' });
      return;
    }
    this.isActive = true;
    this.emit('status', { sessionId, message: 'Starting STT service' });

    // 1. Open Deepgram live transcription
    this.connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
      encoding: 'linear16',
      sample_rate: 44100,
      channels: 2,
      endpointing: 300,
      utterance_end_ms: 1500,
    });

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.emit('connected', { sessionId });
      this.captureAudio(sessionId);
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const text = data.channel.alternatives[0].transcript;
      this.emit('transcript', {
        sessionId,
        text,
        isFinal: data.is_final,
        timestamp: new Date(),
      });
    });

    this.connection.on(LiveTranscriptionEvents.Close, (closeEvent: any) => {
      this.emit('disconnected', { sessionId, closeEvent });
      this.cleanup();
    });

    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      this.emit('error', { sessionId, error });
      this.cleanup();
    });
  }

  private captureAudio(sessionId: string) {
    const ffmpegArgs = [
      '-f', 'dshow',
      '-i', 'audio=Microphone (Realtek(R) Audio)',
      '-f', 's16le',
      '-acodec', 'pcm_s16le',
      '-ar', '44100',
      '-ac', '2',
      'pipe:1',
    ];
    this.ffmpegProcess = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

    this.ffmpegProcess.stdout.on('data', (chunk: Buffer) => {
      if (this.connection.getReadyState() === 1) {
        this.connection.send(chunk);
      }
    });

    this.ffmpegProcess.on('close', (code: number) => {
      this.emit('audioStopped', { sessionId, code });
      this.cleanup();
    });

    this.ffmpegProcess.on('error', (error: any) => {
      this.emit('error', { sessionId, error: `FFmpeg error: ${error}` });
      this.cleanup();
    });
  }

  stopListening() {
    this.cleanup();
  }

  private cleanup() {
    this.isActive = false;
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGTERM');
      this.ffmpegProcess = null;
    }
    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }
  }
}
