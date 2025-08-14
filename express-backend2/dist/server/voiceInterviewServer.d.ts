export declare class VoiceInterviewServer {
    private app;
    private httpServer;
    private io;
    private stt;
    private tts;
    private agent;
    constructor();
    private setupRoutes;
    private setupMiddleware;
    private setupSocketHandlers;
    private setupServiceEvents;
    start(port: number): void;
}
//# sourceMappingURL=voiceInterviewServer.d.ts.map