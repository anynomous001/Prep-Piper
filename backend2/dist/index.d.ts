import { EvaluationWorkFlowState } from './schema';
export declare function loadEnvironment(): boolean;
export declare const initialState: EvaluationWorkFlowState;
export declare class InterviewEvaluator {
    private llm;
    constructor();
    evaluateProblemSolvingSkill(state: EvaluationWorkFlowState): Promise<EvaluationWorkFlowState>;
    evaluateTechnicalSkills(state: EvaluationWorkFlowState): Promise<EvaluationWorkFlowState>;
    aggregator(state: EvaluationWorkFlowState): Promise<EvaluationWorkFlowState>;
}
//# sourceMappingURL=index.d.ts.map