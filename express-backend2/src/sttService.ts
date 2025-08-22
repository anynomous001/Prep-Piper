// enhanced-ttsService.ts
import { EventEmitter } from 'events';
import { createClient } from '@deepgram/sdk';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export class TTSService extends EventEmitter {
  private deepgram: ReturnType<typeof createClient>;
  private outputDir: string;
    private currentSessionId: string | null = null;


  constructor() {
    super();
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    this.outputDir = path.join(process.cwd(), 'audio_output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async speak(text: string, sessionId: string) {
    this.emit('status', { sessionId, message: 'Starting TTS' });
        this.currentSessionId = sessionId;


        
    
    try {
      const response = await this.deepgram.speak.request(
        { text },
         {
    model: 'aura-2-thalia-en',
    encoding: 'linear16',      // Raw PCM
    container: 'wav',        // WAV container
    sample_rate: 24000         // 24 kHz, matches your audio pipeline
  }
             
      );
      const stream = await response.getStream();
      if (!stream) {
        throw new Error('No audio stream');
      }

      const buffer = await this.streamToBuffer(stream);
      const timestamp = Date.now();

      // const filename = path.join(this.outputDir, `speech_${sessionId}_${timestamp}.mp3`);
      const filename = path.join(this.outputDir, `speech_${sessionId}_${timestamp}.wav`);
      fs.writeFileSync(filename, buffer);
      const audioUrl = `/audio/speech_${sessionId}_${timestamp}.wav`;

// const filename = path.join(this.outputDir, `speech_${sessionId}_${timestamp}.l16`);
// const audioUrl = `/audio/speech_${sessionId}_${timestamp}.l16`;





      this.emit('audioGenerated', { 
        sessionId, 
        filename,
        timestamp: new Date(),   
             audioUrl, 
 text 
});

     if (process.platform === 'win32') {
        this.playAudio(filename, sessionId);
      } else {
        // For other platforms, just emit audioFinished after a delay
        setTimeout(() => {
          this.emit('audioFinished', { sessionId, filename, audioUrl });
        }, this.estimateAudioDuration(buffer.length) * 1000);
      }

    } catch (error) {
      console.error('TTS Error:', error);
      //@ts-ignore
      this.emit('error', { sessionId, error: error.toString() });
    }
  }

  private playAudio(filename: string, sessionId: string) {
    // Auto-play on Windows
    const player = spawn('start', ['', filename], { 
      shell: true, 
      detached: true, 
      stdio: 'ignore' 
    });

    player.on('close', (code) => {
      console.log(`Audio player closed with code: ${code}`);
      this.emit('audioFinished', { 
        sessionId, 
        filename, 
        audioUrl: `/audio/${path.basename(filename)}`,
        code 
      });
    });

    player.on('error', (err) => {
      console.error('Audio player error:', err);
      this.emit('error', { sessionId, error: `Audio player error: ${err}` });
      
      // Fallback: emit audioFinished anyway
      setTimeout(() => {
        this.emit('audioFinished', { sessionId, filename });
      }, 2000);
    });
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const data = Uint8Array.from(chunks.flat());
    return Buffer.from(data.buffer);
  }

  // NEW: Estimate audio duration based on buffer size
  private estimateAudioDuration(bufferSize: number): number {
    // Rough estimation for 44.1kHz 16-bit mono WAV
    // Adjust based on actual audio format
    const sampleRate = 44100;
    const bytesPerSample = 2;
    const channels = 1;
    return bufferSize / (sampleRate * bytesPerSample * channels);
  }

  // NEW: Get current session
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // NEW: Stop current audio playback
  stop() {
    this.currentSessionId = null;
    // Add logic to stop current audio if needed
  }
}