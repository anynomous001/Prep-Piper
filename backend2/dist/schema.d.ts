import { z } from 'zod';
export declare const ProficiencyLevelSchema: z.ZodEnum<{
    beginner: "beginner";
    intermediate: "intermediate";
    advanced: "advanced";
    expert: "expert";
}>;
export declare const ConfidenceLevelSchema: z.ZodEnum<{
    low: "low";
    medium: "medium";
    high: "high";
    very_high: "very_high";
}>;
export declare const InterviewDataSchema: z.ZodObject<{
    tech_stack: z.ZodString;
    position: z.ZodString;
    question_count: z.ZodNumber;
    difficulty: z.ZodString;
    conversation_history: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type InterviewData = z.infer<typeof InterviewDataSchema>;
export declare const TechnicalSkillAssessmentSchema: z.ZodObject<{
    skill_name: z.ZodString;
    proficiency_level: z.ZodDefault<z.ZodEnum<{
        beginner: "beginner";
        intermediate: "intermediate";
        advanced: "advanced";
        expert: "expert";
    }>>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodString>>;
    confidence: z.ZodDefault<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        very_high: "very_high";
    }>>;
    comments: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const ProblemSolvingInstanceSchema: z.ZodObject<{
    problem_statement: z.ZodString;
    solution: z.ZodString;
    approach_quality: z.ZodNumber;
    solution_effectiveness: z.ZodNumber;
    reasoning_clarity: z.ZodNumber;
}, z.core.$strip>;
export declare const EvaluationWorkFlowStateSchema: z.ZodObject<{
    interview_data: z.ZodUnknown;
    current_step: z.ZodString;
    errors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    problem_solving_instances: z.ZodDefault<z.ZodArray<z.ZodObject<{
        problem_statement: z.ZodString;
        solution: z.ZodString;
        approach_quality: z.ZodNumber;
        solution_effectiveness: z.ZodNumber;
        reasoning_clarity: z.ZodNumber;
    }, z.core.$strip>>>;
    problem_solving_score: z.ZodDefault<z.ZodNumber>;
    analytical_thinking_score: z.ZodDefault<z.ZodNumber>;
    debugging_potential_score: z.ZodDefault<z.ZodNumber>;
    problem_solving_approach: z.ZodDefault<z.ZodString>;
    technical_skills: z.ZodDefault<z.ZodArray<z.ZodObject<{
        skill_name: z.ZodString;
        proficiency_level: z.ZodDefault<z.ZodEnum<{
            beginner: "beginner";
            intermediate: "intermediate";
            advanced: "advanced";
            expert: "expert";
        }>>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodString>>;
        confidence: z.ZodDefault<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            very_high: "very_high";
        }>>;
        comments: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>>;
    technical_consistency_score: z.ZodDefault<z.ZodNumber>;
    technical_depth_score: z.ZodDefault<z.ZodNumber>;
    technical_knowledge_gaps: z.ZodDefault<z.ZodArray<z.ZodString>>;
    technical_strengths: z.ZodDefault<z.ZodArray<z.ZodString>>;
    overall_score: z.ZodDefault<z.ZodNumber>;
    key_strengths: z.ZodDefault<z.ZodArray<z.ZodString>>;
    critical_weaknesses: z.ZodDefault<z.ZodArray<z.ZodString>>;
    recommendation: z.ZodDefault<z.ZodEnum<{
        "Strong Hire": "Strong Hire";
        Hire: "Hire";
        "No Hire": "No Hire";
        "Strong No Hire": "Strong No Hire";
    }>>;
    development_areas: z.ZodDefault<z.ZodArray<z.ZodString>>;
    evaluation_timestamp: z.ZodOptional<z.ZodString>;
    candidate_id: z.ZodOptional<z.ZodString>;
    position_evaluated_for: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type TechnicalSkillAssessment = z.infer<typeof TechnicalSkillAssessmentSchema>;
export type ProblemSolvingInstance = z.infer<typeof ProblemSolvingInstanceSchema>;
export type EvaluationWorkFlowState = z.infer<typeof EvaluationWorkFlowStateSchema>;
export declare const TechnicalEvaluationOutputSchema: z.ZodObject<{
    technical_skills: z.ZodDefault<z.ZodArray<z.ZodObject<{
        skill_name: z.ZodString;
        proficiency_level: z.ZodDefault<z.ZodEnum<{
            beginner: "beginner";
            intermediate: "intermediate";
            advanced: "advanced";
            expert: "expert";
        }>>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodString>>;
        confidence: z.ZodDefault<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            very_high: "very_high";
        }>>;
        comments: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>>;
    technical_consistency_score: z.ZodDefault<z.ZodNumber>;
    technical_depth_score: z.ZodDefault<z.ZodNumber>;
    technical_knowledge_gaps: z.ZodDefault<z.ZodArray<z.ZodString>>;
    technical_strengths: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const ProblemSolvingOutputSchema: z.ZodObject<{
    problem_solving_instances: z.ZodDefault<z.ZodArray<z.ZodObject<{
        problem_statement: z.ZodString;
        solution: z.ZodString;
        approach_quality: z.ZodNumber;
        solution_effectiveness: z.ZodNumber;
        reasoning_clarity: z.ZodNumber;
    }, z.core.$strip>>>;
    problem_solving_score: z.ZodDefault<z.ZodNumber>;
    analytical_thinking_score: z.ZodDefault<z.ZodNumber>;
    debugging_potential_score: z.ZodDefault<z.ZodNumber>;
    problem_solving_approach: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const AnalyticalThinkingOutputSchema: z.ZodObject<{
    score: z.ZodNumber;
    evidence: z.ZodArray<z.ZodString>;
    reasoning_quality: z.ZodString;
}, z.core.$strip>;
export declare const DebuggingEvaluationOutputSchema: z.ZodObject<{
    score: z.ZodNumber;
    evidence: z.ZodArray<z.ZodString>;
    improvements: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const FinalReportOutputSchema: z.ZodObject<{
    overall_score: z.ZodDefault<z.ZodNumber>;
    key_strengths: z.ZodArray<z.ZodString>;
    critical_weaknesses: z.ZodArray<z.ZodString>;
    recommendation: z.ZodEnum<{
        "Strong Hire": "Strong Hire";
        Hire: "Hire";
        "No Hire": "No Hire";
        "Strong No Hire": "Strong No Hire";
    }>;
    development_areas: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type TechnicalEvaluationOutput = z.infer<typeof TechnicalEvaluationOutputSchema>;
export type ProblemSolvingOutput = z.infer<typeof ProblemSolvingOutputSchema>;
export type AnalyticalThinkingOutput = z.infer<typeof AnalyticalThinkingOutputSchema>;
export type DebuggingEvaluationOutput = z.infer<typeof DebuggingEvaluationOutputSchema>;
export type FinalReportOutput = z.infer<typeof FinalReportOutputSchema>;
//# sourceMappingURL=schema.d.ts.map