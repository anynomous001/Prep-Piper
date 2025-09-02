export declare class VoiceInterviewServer {
    private app;
    private server;
    private io;
    private agent;
    private activeSessions;
    private socketToSession;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    private setupSocketHandlers;
    private setupServiceEvents;
    private cleanupSession;
    start(port: number): void;
    stop(): Promise<void>;
}
//# sourceMappingURL=voiceInterviewServer.d.ts.map