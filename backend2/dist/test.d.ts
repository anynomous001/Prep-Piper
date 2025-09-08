import { InterviewEvaluator } from './index';
export declare function testProblemSolvingEvaluator(evaluator: InterviewEvaluator): Promise<TestResult>;
export declare function testTechnicalSkillsEvaluator(evaluator: InterviewEvaluator): Promise<TestResult>;
export declare function testAggregatorMethod(evaluator: InterviewEvaluator): Promise<TestResult>;
export declare function testCompleteWorkflow(evaluator: InterviewEvaluator): Promise<TestResult>;
export declare function testErrorHandling(evaluator: InterviewEvaluator): Promise<TestResult>;
export declare function runAllTests(): Promise<TestSummary>;
interface TestResult {
    testName: string;
    passed: boolean;
    duration: number;
    error: string | null;
}
interface TestSummary {
    success: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
    results: TestResult[];
}
export {};
//# sourceMappingURL=test.d.ts.map