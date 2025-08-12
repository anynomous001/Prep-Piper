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
    try {
      const response = await this.deepgram.speak.request(
        { text },
        { model: 'aura-2-thalia-en', encoding: 'linear16', container: 'wav' }
      );
      const stream = await response.getStream();
      if (!stream) {
        throw new Error('No audio stream');
      }

      const buffer = await this.streamToBuffer(stream);
      const filename = path.join(this.outputDir, `speech_${sessionId}_${Date.now()}.wav`);
      fs.writeFileSync(filename, buffer);

      this.emit('audioGenerated', { sessionId, filename, text });

      // Auto-play on Windows
      const player = spawn('start', ['', filename], { shell: true, detached: true, stdio: 'ignore' });
      player.on('close', () => this.emit('audioFinished', { sessionId, filename }));
      player.on('error', (err) => this.emit('error', { sessionId, error: err }));

    } catch (error) {
      this.emit('error', { sessionId, error });
    }
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
}
