import { EventEmitter } from 'events';
export declare class TTSService extends EventEmitter {
    private deepgram;
    private outputDir;
    constructor();
    speak(text: string, sessionId: string): Promise<void>;
    private streamToBuffer;
}
//# sourceMappingURL=ttsService.d.ts.map