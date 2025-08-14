import { EventEmitter } from 'events';
export declare class STTService extends EventEmitter {
    private deepgram;
    private connection;
    private ffmpegProcess;
    private isActive;
    private currentSessionId;
    constructor();
    startListening(sessionId: string): Promise<void>;
    processAudioChunk(sessionId: string, chunk: ArrayBuffer | Buffer): void;
    startListeningForFrontendAudio(sessionId: string): Promise<void>;
    finalizeAudioStream(sessionId: string): void;
    private captureAudio;
    stopListening(): void;
    private isFrontendAudioMode;
    private cleanup;
    isConnected(): boolean;
    getCurrentSessionId(): string | null;
    restartConnection(sessionId: string): Promise<void>;
}
//# sourceMappingURL=sttService.d.ts.map