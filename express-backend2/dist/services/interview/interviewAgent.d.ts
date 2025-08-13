/**
 * A simplified and robust technical interview agent with enhanced error handling.
 * Converted from Python to TypeScript
 *

 */
import { EventEmitter } from 'events';
export declare class InterviewAgent extends EventEmitter {
    private sessions;
    private readonly maxQuestions;
    private readonly llm;
    constructor();
    /**
     * Start a new interview session
     */
    startInterview(techStack?: string, position?: string): [string | null, string];
    /**
     * Process candidate answer and generate next question
     */
    processAnswer(sessionId: string, answer: string): Promise<string>;
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