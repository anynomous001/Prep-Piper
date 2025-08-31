export declare class VoiceInterviewServer {
    private app;
    private server;
    private io;
    private sttService;
    private ttsService;
    private agent;
    private activeSessions;
    private socketToSession;
    private ttsEnabled;
    constructor();
    private ensureAudioDirectory;
    private setupMiddleware;
    private setupRoutes;
    private setupSocketHandlers;
    private setupServiceEvents;
    private generateTTSAudio;
    private cleanupSession;
    start(port: number): void;
    stop(): Promise<void>;
}
//# sourceMappingURL=voiceInterviewServer.d.ts.map