export declare class VoiceInterviewServer {
    private app;
    private server;
    private io;
    private sttService;
    private activeSessions;
    private socketToSession;
    constructor();
    private ensureAudioDirectory;
    private setupMiddleware;
    private setupRoutes;
    private setupSocketHandlers;
    private setupSTTHandlers;
    private generateInterviewQuestion;
    private generateTTSAudio;
    private createMockAudioFile;
    private processTranscriptAndRespond;
    private cleanupSession;
    start(port: number): void;
    stop(): Promise<void>;
}
//# sourceMappingURL=voiceInterviewServer.d.ts.map