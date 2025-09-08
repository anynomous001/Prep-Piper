// schemas.ts
import { z } from 'zod';

// Enums
export const ProficiencyLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);
export const ConfidenceLevelSchema = z.enum(["low", "medium", "high", "very_high"]);


export const InterviewDataSchema = z.object({
  tech_stack: z.string(),
  position: z.string(),
  question_count: z.number(),
  difficulty: z.string(),
  conversation_history: z.array(z.object({
    role: z.string(),
    content: z.string()
  }))
});


export type InterviewData = z.infer<typeof InterviewDataSchema>;


// Technical Skill Assessment Schema
export const TechnicalSkillAssessmentSchema = z.object({
  skill_name: z.string().describe("Name of the technical skill"),
  proficiency_level: ProficiencyLevelSchema.default("beginner").describe("Proficiency level of the skill"),
  evidence: z.array(z.string()).default(["No evidence found"]).describe("List of evidence that supports this assessment of this technical skill"),
  confidence: ConfidenceLevelSchema.default("low").describe("Confidence level of the assessment"),
  comments: z.string().default("No additional comments").describe("Comments on the assessment")
});

// Problem Solving Instance Schema  
export const ProblemSolvingInstanceSchema = z.object({
  problem_statement: z.string().describe("Statement of the problem"),
  solution: z.string().describe("Solution to the problem"),
  approach_quality: z.number().int().min(1).max(10).describe("Quality of approach taken (1-10)"),
  solution_effectiveness: z.number().int().min(1).max(10).describe("Effectiveness of solution (1-10)"),
  reasoning_clarity: z.number().int().min(1).max(10).describe("Clarity of reasoning (1-10)")
});

// Main Evaluation Workflow State Schema
export const EvaluationWorkFlowStateSchema = z.object({
  // Core data
  interview_data: z.unknown().describe("Raw interview json data for evaluation"),
  current_step: z.string().describe("Current step in the workflow"),
  errors: z.array(z.string()).default([]).describe("List of errors encountered during evaluation"),

  // Problem solving assessment
  problem_solving_instances: z.array(ProblemSolvingInstanceSchema).default([]).describe("List of problem solving instances"),
  problem_solving_score: z.number().int().min(0).max(10).default(0).describe("Overall score on problem solving"),
  analytical_thinking_score: z.number().int().min(0).max(10).default(0).describe("Overall score on analytical thinking"),
  debugging_potential_score: z.number().int().min(0).max(10).default(0).describe("debugging skill"),
  problem_solving_approach: z.string().default("").describe("Overall approach taken on problem solving"),

  // Technical skills assessment
  technical_skills: z.array(TechnicalSkillAssessmentSchema).default([]).describe("List of technical skill assessments"),
  technical_consistency_score: z.number().int().min(0).max(10).default(0).describe("Technical consistency score"),
  technical_depth_score: z.number().int().min(0).max(10).default(0).describe("Overall score on technical depth"),
  technical_knowledge_gaps: z.array(z.string()).default([]),
  technical_strengths: z.array(z.string()).default([]),

  // Overall assessment
  overall_score: z.number().min(0).max(10).default(0),
  key_strengths: z.array(z.string()).default([]),
  critical_weaknesses: z.array(z.string()).default([]),
  recommendation: z.enum(["Strong Hire", "Hire", "No Hire", "Strong No Hire"]).default("No Hire"),
  development_areas: z.array(z.string()).default([]),

  // Metadata
  evaluation_timestamp: z.string().optional(),
  candidate_id: z.string().optional(),
  position_evaluated_for: z.string().default("Frontend Developer")
});

// Type inference from schemas
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type TechnicalSkillAssessment = z.infer<typeof TechnicalSkillAssessmentSchema>;
export type ProblemSolvingInstance = z.infer<typeof ProblemSolvingInstanceSchema>;
export type EvaluationWorkFlowState = z.infer<typeof EvaluationWorkFlowStateSchema>;

// Additional structured output schemas for LLM responses
export const TechnicalEvaluationOutputSchema = z.object({
  technical_skills: z.array(TechnicalSkillAssessmentSchema).default([]).describe("List of technical skill assessments"),
  technical_consistency_score: z.number().int().min(0).max(10).default(0).describe("Technical consistency score"),
  technical_depth_score: z.number().int().min(0).max(10).default(0).describe("Overall score on technical depth"),
  technical_knowledge_gaps: z.array(z.string()).default([]),
  technical_strengths: z.array(z.string()).default([]),
});

export const ProblemSolvingOutputSchema = z.object({
  problem_solving_instances: z.array(ProblemSolvingInstanceSchema).default([]).describe("List of problem solving instances"),
  problem_solving_score: z.number().int().min(0).max(10).default(0).describe("Overall score on problem solving"),
  analytical_thinking_score: z.number().int().min(0).max(10).default(0).describe("Overall score on analytical thinking"),
  debugging_potential_score: z.number().int().min(0).max(10).default(0).describe("debugging skill"),
  problem_solving_approach: z.string().default("").describe("Overall approach taken on problem solving"),
});

export const AnalyticalThinkingOutputSchema = z.object({
  score: z.number().int().min(1).max(10),
  evidence: z.array(z.string()),
  reasoning_quality: z.string()
});

export const DebuggingEvaluationOutputSchema = z.object({
  score: z.number().int().min(1).max(10),
  evidence: z.array(z.string()),
  improvements: z.array(z.string())
});

export const FinalReportOutputSchema = z.object({
  overall_score: z.number().min(0).max(10).default(0),
  key_strengths: z.array(z.string()),
  critical_weaknesses: z.array(z.string()),
  recommendation: z.enum(["Strong Hire", "Hire", "No Hire", "Strong No Hire"]),
  development_areas: z.array(z.string())
});

// Export additional inferred types
export type TechnicalEvaluationOutput = z.infer<typeof TechnicalEvaluationOutputSchema>;
export type ProblemSolvingOutput = z.infer<typeof ProblemSolvingOutputSchema>;
export type AnalyticalThinkingOutput = z.infer<typeof AnalyticalThinkingOutputSchema>;
export type DebuggingEvaluationOutput = z.infer<typeof DebuggingEvaluationOutputSchema>;
export type FinalReportOutput = z.infer<typeof FinalReportOutputSchema>;
