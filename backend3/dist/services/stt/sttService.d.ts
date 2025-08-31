import { EventEmitter } from "events";
interface STTSession {
    sessionId: string;
    connection: any;
    isActive: boolean;
    createdAt: Date;
    socketId: string | null;
    lastActivityAt: Date;
}
export declare class STTService extends EventEmitter {
    private deepgram;
    private sessions;
    private cleanupInterval;
    constructor();
    private cleanupStaleSessions;
    startSession(sessionId: string, socketId?: string): Promise<void>;
    processAudioChunk(sessionId: string, audioData: Buffer | ArrayBuffer): void;
    finishSession(sessionId: string): void;
    cleanupBySocketId(socketId: string): void;
    private cleanupSession;
    getActiveSessionsCount(): number;
    getSessionInfo(sessionId: string): STTSession | null;
    isSessionActive(sessionId: string): boolean;
    getAllActiveSessions(): string[];
    cleanup(): Promise<void>;
}
export {};
//# sourceMappingURL=sttService.d.ts.map