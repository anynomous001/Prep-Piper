import { EventEmitter } from "events";
export declare class TTSService extends EventEmitter {
    private currentSessionId;
    constructor();
    speak(text: string, sessionId: string): Promise<void>;
    getCurrentSessionId(): string | null;
    stop(): void;
}
//# sourceMappingURL=ttsService.d.ts.map