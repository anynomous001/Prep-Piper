import { EventEmitter } from 'events';
export declare class STTService extends EventEmitter {
    private deepgram;
    private connection;
    private ffmpegProcess;
    private isActive;
    constructor();
    startListening(sessionId: string): Promise<void>;
    private captureAudio;
    stopListening(): void;
    private cleanup;
}
//# sourceMappingURL=sttService.d.ts.map