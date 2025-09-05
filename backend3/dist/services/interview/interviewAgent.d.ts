import { EventEmitter } from "events";
export declare class InterviewAgent extends EventEmitter {
    private sessions;
    private readonly maxQuestions;
    private readonly llm;
    constructor();
    /**
     * Start a new interview session
     */
    startInterview(techStack?: string, position?: string, externalSessionId?: string): [string | null, string];
    /**
     * Process candidate answer and generate next question
     */
    processAnswer(sessionId: string, answer: string): Promise<string>;
    /**
       * UPDATE: Enhanced end interview early with contextual messages
       */
    endInterviewEarly(sessionId: string): string;
    /**
     * UPDATE: Generate contextual early termination messages
     */
    private generateEarlyTerminationMessage;
    private generateNextQuestion;
    private generateCompletionMessage;
    /**
     * Get detailed session summary
     */
    getSummary(sessionId: string): string;
    /**
     * Save session to file
     */
    saveSession(sessionId: string): Promise<void>;
}
//# sourceMappingURL=interviewAgent.d.ts.map