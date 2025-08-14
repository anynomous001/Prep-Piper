import { EventEmitter } from 'events';
export declare class TTSService extends EventEmitter {
    private deepgram;
    private outputDir;
    private currentSessionId;
    constructor();
    speak(text: string, sessionId: string): Promise<void>;
    private playAudio;
    private streamToBuffer;
    private estimateAudioDuration;
    getCurrentSessionId(): string | null;
    stop(): void;
}
//# sourceMappingURL=ttsService.d.ts.map