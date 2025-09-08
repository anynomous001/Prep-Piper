"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalReportOutputSchema = exports.DebuggingEvaluationOutputSchema = exports.AnalyticalThinkingOutputSchema = exports.ProblemSolvingOutputSchema = exports.TechnicalEvaluationOutputSchema = exports.EvaluationWorkFlowStateSchema = exports.ProblemSolvingInstanceSchema = exports.TechnicalSkillAssessmentSchema = exports.InterviewDataSchema = exports.ConfidenceLevelSchema = exports.ProficiencyLevelSchema = void 0;
// schemas.ts
const zod_1 = require("zod");
// Enums
exports.ProficiencyLevelSchema = zod_1.z.enum(["beginner", "intermediate", "advanced", "expert"]);
exports.ConfidenceLevelSchema = zod_1.z.enum(["low", "medium", "high", "very_high"]);
exports.InterviewDataSchema = zod_1.z.object({
    tech_stack: zod_1.z.string(),
    position: zod_1.z.string(),
    question_count: zod_1.z.number(),
    difficulty: zod_1.z.string(),
    conversation_history: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.string(),
        content: zod_1.z.string()
    }))
});
// Technical Skill Assessment Schema
exports.TechnicalSkillAssessmentSchema = zod_1.z.object({
    skill_name: zod_1.z.string().describe("Name of the technical skill"),
    proficiency_level: exports.ProficiencyLevelSchema.default("beginner").describe("Proficiency level of the skill"),
    evidence: zod_1.z.array(zod_1.z.string()).default(["No evidence found"]).describe("List of evidence that supports this assessment of this technical skill"),
    confidence: exports.ConfidenceLevelSchema.default("low").describe("Confidence level of the assessment"),
    comments: zod_1.z.string().default("No additional comments").describe("Comments on the assessment")
});
// Problem Solving Instance Schema  
exports.ProblemSolvingInstanceSchema = zod_1.z.object({
    problem_statement: zod_1.z.string().describe("Statement of the problem"),
    solution: zod_1.z.string().describe("Solution to the problem"),
    approach_quality: zod_1.z.number().int().min(1).max(10).describe("Quality of approach taken (1-10)"),
    solution_effectiveness: zod_1.z.number().int().min(1).max(10).describe("Effectiveness of solution (1-10)"),
    reasoning_clarity: zod_1.z.number().int().min(1).max(10).describe("Clarity of reasoning (1-10)")
});
// Main Evaluation Workflow State Schema
exports.EvaluationWorkFlowStateSchema = zod_1.z.object({
    // Core data
    interview_data: zod_1.z.unknown().describe("Raw interview json data for evaluation"),
    current_step: zod_1.z.string().describe("Current step in the workflow"),
    errors: zod_1.z.array(zod_1.z.string()).default([]).describe("List of errors encountered during evaluation"),
    // Problem solving assessment
    problem_solving_instances: zod_1.z.array(exports.ProblemSolvingInstanceSchema).default([]).describe("List of problem solving instances"),
    problem_solving_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Overall score on problem solving"),
    analytical_thinking_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Overall score on analytical thinking"),
    debugging_potential_score: zod_1.z.number().int().min(0).max(10).default(0).describe("debugging skill"),
    problem_solving_approach: zod_1.z.string().default("").describe("Overall approach taken on problem solving"),
    // Technical skills assessment
    technical_skills: zod_1.z.array(exports.TechnicalSkillAssessmentSchema).default([]).describe("List of technical skill assessments"),
    technical_consistency_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Technical consistency score"),
    technical_depth_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Overall score on technical depth"),
    technical_knowledge_gaps: zod_1.z.array(zod_1.z.string()).default([]),
    technical_strengths: zod_1.z.array(zod_1.z.string()).default([]),
    // Overall assessment
    overall_score: zod_1.z.number().min(0).max(10).default(0),
    key_strengths: zod_1.z.array(zod_1.z.string()).default([]),
    critical_weaknesses: zod_1.z.array(zod_1.z.string()).default([]),
    recommendation: zod_1.z.enum(["Strong Hire", "Hire", "No Hire", "Strong No Hire"]).default("No Hire"),
    development_areas: zod_1.z.array(zod_1.z.string()).default([]),
    // Metadata
    evaluation_timestamp: zod_1.z.string().optional(),
    candidate_id: zod_1.z.string().optional(),
    position_evaluated_for: zod_1.z.string().default("Frontend Developer")
});
// Additional structured output schemas for LLM responses
exports.TechnicalEvaluationOutputSchema = zod_1.z.object({
    technical_skills: zod_1.z.array(exports.TechnicalSkillAssessmentSchema).default([]).describe("List of technical skill assessments"),
    technical_consistency_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Technical consistency score"),
    technical_depth_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Overall score on technical depth"),
    technical_knowledge_gaps: zod_1.z.array(zod_1.z.string()).default([]),
    technical_strengths: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.ProblemSolvingOutputSchema = zod_1.z.object({
    problem_solving_instances: zod_1.z.array(exports.ProblemSolvingInstanceSchema).default([]).describe("List of problem solving instances"),
    problem_solving_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Overall score on problem solving"),
    analytical_thinking_score: zod_1.z.number().int().min(0).max(10).default(0).describe("Overall score on analytical thinking"),
    debugging_potential_score: zod_1.z.number().int().min(0).max(10).default(0).describe("debugging skill"),
    problem_solving_approach: zod_1.z.string().default("").describe("Overall approach taken on problem solving"),
});
exports.AnalyticalThinkingOutputSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(1).max(10),
    evidence: zod_1.z.array(zod_1.z.string()),
    reasoning_quality: zod_1.z.string()
});
exports.DebuggingEvaluationOutputSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(1).max(10),
    evidence: zod_1.z.array(zod_1.z.string()),
    improvements: zod_1.z.array(zod_1.z.string())
});
exports.FinalReportOutputSchema = zod_1.z.object({
    overall_score: zod_1.z.number().min(0).max(10).default(0),
    key_strengths: zod_1.z.array(zod_1.z.string()),
    critical_weaknesses: zod_1.z.array(zod_1.z.string()),
    recommendation: zod_1.z.enum(["Strong Hire", "Hire", "No Hire", "Strong No Hire"]),
    development_areas: zod_1.z.array(zod_1.z.string())
});
//# sourceMappingURL=schema.js.map