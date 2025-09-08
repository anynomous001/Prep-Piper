"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewEvaluator = exports.initialState = void 0;
exports.loadEnvironment = loadEnvironment;
const dotenv_1 = require("dotenv");
const groq_1 = require("@langchain/groq");
const messages_1 = require("@langchain/core/messages");
const schema_1 = require("./schema");
const data_1 = require("./data/data");
function loadEnvironment() {
    try {
        (0, dotenv_1.config)();
        const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
        if (!apiKey) {
            console.log("❌ API key not found in environment");
            console.log("Please add GROQ_API_KEY, OPENAI_API_KEY, or LLM_API_KEY to your .env file");
            return false;
        }
        console.log("✓ Environment variables loaded");
        return true;
    }
    catch (error) {
        console.log(`❌ Error loading environment: ${error}`);
        return false;
    }
}
exports.initialState = {
    interview_data: data_1.demoInterviewData,
    current_step: "initialization",
    errors: [],
    problem_solving_instances: [],
    problem_solving_score: 0,
    analytical_thinking_score: 0,
    debugging_potential_score: 0,
    problem_solving_approach: "",
    technical_skills: [],
    technical_consistency_score: 0,
    technical_depth_score: 0,
    technical_knowledge_gaps: [],
    technical_strengths: [],
    overall_score: 0,
    key_strengths: [],
    critical_weaknesses: [],
    position_evaluated_for: data_1.demoInterviewData.position,
    recommendation: "No Hire",
    development_areas: []
};
class InterviewEvaluator {
    llm;
    constructor() {
        this.llm = new groq_1.ChatGroq({
            model: "llama-3.3-70b-versatile", // Use this instead
            temperature: 0.3,
            maxRetries: 2
        });
    }
    async evaluateProblemSolvingSkill(state) {
        console.log('llm2 got called');
        try {
            const systemPrompt = `
    You are a senior software developer specialized in evaluating problem solving abilities and implementation abilities.

    Your task is to evaluate candidate's approach to a problem, ability to analyze it and quality of implemented solution.

    Focus on:
    1. Problem solving method and attempted solution
    2. Effectiveness of solution
    3. Ability to analyzing the problem and logical reasoning
    4. Quality of approach taken by the candidate
    5. Debugging potential and troubleshooting skills
    6. Creativity in finding solutions

    Return your response in JSON structure following the format given below:
    {
    "instances": [{
        "problem_statement": "E-commerce real-time inventory challenge",
        "solution": "Implemented a live websocket based live inventory tracking system integrated with redis for fast cache updates",
        "approach_quality": 9,
        "solution_effectiveness": 8,
        "reasoning_clarity": 9
    }],
    "problem_solving_score": 6,
    "problem_solving_approach": "Systematic approach with consideration of real-world constraints"
    }

    Evaluate specific instances where the candidate solved problems or explained their approach.`;
            const humanPrompt = `Analyze this interview conversation for problem-solving and implementation abilities:

    Interview Data: ${JSON.stringify(state.interview_data)}

    Return only valid JSON following the specified structure.`;
            const messages = [
                new messages_1.SystemMessage(systemPrompt),
                new messages_1.HumanMessage(humanPrompt)
            ];
            // Use structured output with Zod validation
            const structuredLlm = this.llm.withStructuredOutput(schema_1.ProblemSolvingOutputSchema);
            const response = await structuredLlm.invoke(messages);
            console.log('Raw LLM Response:', JSON.stringify(response, null, 2));
            // Update state with validated results
            state.problem_solving_instances = response.problem_solving_instances || [];
            state.problem_solving_score = response.problem_solving_score || 0;
            state.problem_solving_approach = response.problem_solving_approach || "";
            state.debugging_potential_score = response.debugging_potential_score || 0;
            state.analytical_thinking_score = response.analytical_thinking_score || 0;
            state.current_step = "llm2_completed";
            // state['problem_solving_instances'] = response.get("problem_solving_instances", [])
            // state['analytical_thinking_score'] = response.get("analytical_thinking_score", 0)
            // state['problem_solving_score'] = response.get("problem_solving_score", 0)
            // state['debugging_potential_score'] = response.get("debugging_potential_score", 0)
            // state['problem_solving_approach'] = response.get("problem_solving_approach", "")
            // state['current_step'] = "llm2_completed";
            console.log("LLM2 completed successfully!");
        }
        catch (error) {
            console.error(`Error in problem solving evaluator: ${error}`);
            state.errors.push(`Problem solving evaluation failed: ${error}`);
            state.current_step = "llm2_failed";
            throw error;
        }
        return state;
    }
    async evaluateTechnicalSkills(state) {
        console.log('LLM1 got called');
        try {
            const systemPrompt = `
You are a Senior Technical Interviewer specializing in evaluating technical skills and knowledge depth.

Your task is to analyze the interview conversation and assess the candidate's technical competencies.

Focus on:
1. Depth of technical understanding
2. Specific skills demonstrated (HTML, CSS, JavaScript, frameworks, etc.)
3. Quality of technical explanations
4. Knowledge gaps and areas needing improvement

Return your analysis in JSON format with the following structure:
{
  "position_evaluated_for": "Frontend developer",
  "technical_skills": [
    {
      "skill_name": "JavaScript",
      "proficiency_level": "intermediate",
      "evidence": ["Explained closures correctly", "Mentioned ES6 features"],
      "confidence": "high",
      "comments": "Good understanding shown"
    }
  ],
  "technical_consistency_score": 7,
  "technical_depth_score": 6,
  "technical_knowledge_gaps": ["Advanced React patterns", "Testing frameworks"],
  "technical_strengths": ["Strong JavaScript fundamentals", "Good understanding of async programming"]
}

IMPORTANT: 
- Use "evidence" not "evidance"
- Use "confidence" not "confidence_level" 
- Always include "comments" field for each skill
- proficiency_level must be one of: "beginner", "intermediate", "advanced", "expert"
- confidence must be one of: "low", "medium", "high", "very_high"

Be thorough but fair in your assessment.`;
            const humanPrompt = `Analyze this interview conversation for technical skills:

Interview Data: ${JSON.stringify(state.interview_data)}

Return only valid JSON following the specified structure.`;
            const messages = [
                new messages_1.SystemMessage(systemPrompt),
                new messages_1.HumanMessage(humanPrompt)
            ];
            console.log('calling llm1');
            // Use structured output with Zod validation
            const structuredLlm = this.llm.withStructuredOutput(schema_1.TechnicalEvaluationOutputSchema);
            const response = await structuredLlm.invoke(messages);
            console.log("Raw LLM Response:");
            console.log(JSON.stringify(response, null, 2));
            // Update state with technical evaluation results
            state.technical_skills = response?.technical_skills?.map(skill => schema_1.TechnicalSkillAssessmentSchema.parse(skill)) || [];
            state.technical_consistency_score = response.technical_consistency_score || 0;
            state.technical_depth_score = response.technical_depth_score || 0;
            state.technical_knowledge_gaps = response.technical_knowledge_gaps || [];
            state.technical_strengths = response.technical_strengths || [];
            state.current_step = "llm1_completed";
            console.log("LLM1 completed successfully!");
        }
        catch (error) {
            let errorMsg;
            if (error instanceof Error) {
                if (error.name === 'SyntaxError' || error.message.includes('JSON')) {
                    errorMsg = `LLM1 JSON parsing error: ${error.message}`;
                }
                else if (error.message.includes('missing field')) {
                    errorMsg = `LLM1 Key error - missing field: ${error.message}`;
                }
                else {
                    errorMsg = `LLM1 Technical Evaluator error: ${error.message}`;
                }
            }
            else {
                errorMsg = `LLM1 Technical Evaluator error: ${String(error)}`;
            }
            state.errors.push(errorMsg);
            console.error(`Error: ${errorMsg}`);
            state.current_step = "llm1_failed";
            throw error;
        }
        return state;
    }
    async aggregator(state) {
        console.log('aggregator called');
        try {
            // Validation of required fields
            const requiredFields = [
                state.technical_skills.length > 0,
                state.technical_consistency_score > 0
            ];
            if (!requiredFields.every(Boolean)) {
                state.errors.push("Aggregator: Not all LLM evaluations completed successfully");
                return state;
            }
            // Create evaluation summary
            const evaluationSummary = {
                technical_evaluation: {
                    skills: state.technical_skills,
                    consistency_score: state.technical_consistency_score,
                    depth_score: state.technical_depth_score,
                    gaps: state.technical_knowledge_gaps,
                    strengths: state.technical_strengths
                },
                problem_solving_evaluation: {
                    instances: state.problem_solving_instances,
                    analytical_score: state.analytical_thinking_score,
                    debugging_score: state.debugging_potential_score,
                    approach: state.problem_solving_approach,
                    overall_score: state.problem_solving_score,
                    // Note: comments_on_clarity_of_communication might not exist in your schema
                    // comments_on_clarity_of_communication: state.comments_on_clarity_of_communication || ""
                },
                original_interview: state.interview_data,
            };
            const systemPrompt = `
You are a Senior Hiring Manager with expertise in technical recruitment and candidate assessment.

Your task is to synthesize evaluations from multiple specialist areas into a comprehensive final assessment.

Create a final evaluation that:
- Calculates weighted overall score (0-10 scale)
- Identifies key strengths and critical weaknesses  
- Provides clear hiring recommendation
- Gives actionable development areas

Return JSON with this structure:
{
  "key_strengths": ["Strong JavaScript fundamentals", "Good problem-solving approach"],
  "critical_weaknesses": ["Limited React experience", "No testing knowledge"],
  "recommendation": "Hire",
  "development_areas": ["Improve React skills", "Learn testing frameworks"]
}

Be thorough, fair, and constructive. Focus on actionable insights.`;
            const humanPrompt = `Synthesize this comprehensive evaluation data into a final assessment:

Evaluation Data: ${JSON.stringify(evaluationSummary, null, 2)}

Position: ${state.position_evaluated_for}

Calculate the overall score using these weights:
- Technical Skills (40%): Based on technical_consistency_score and technical_depth_score
- Problem Solving (35%): Based on analytical_thinking_score and problem_solving_score  
- Communication (25%): Based on problem solving instances communication quality

Return only valid JSON following the specified structure.`;
            const messages = [
                new messages_1.SystemMessage(systemPrompt),
                new messages_1.HumanMessage(humanPrompt)
            ];
            // Use structured output for better reliability
            const structuredLlm = this.llm.withStructuredOutput(schema_1.FinalReportOutputSchema);
            const response = await structuredLlm.invoke(messages);
            console.log('Aggregator result:', JSON.stringify(response, null, 2));
            // Calculate overall score based on weights
            const technicalScore = (state.technical_consistency_score + state.technical_depth_score) / 2;
            const problemSolvingScore = (state.analytical_thinking_score + state.problem_solving_score) / 2;
            const communicationScore = state.problem_solving_instances.length > 0
                ? state.problem_solving_instances.reduce((acc, instance) => acc + instance.reasoning_clarity, 0) / state.problem_solving_instances.length
                : 5; // Default if no instances
            const overallScore = (technicalScore * 0.4 +
                problemSolvingScore * 0.35 +
                communicationScore * 0.25);
            // Update state with results
            state.overall_score = Math.round(overallScore * 10) / 10; // Round to 1 decimal
            state.key_strengths = response.key_strengths || [];
            state.critical_weaknesses = response.critical_weaknesses || [];
            // Set metadata
            state.evaluation_timestamp = new Date().toISOString();
            state.candidate_id = state.interview_data?.candidate_id || "unknown";
            state.current_step = "completed";
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            state.errors.push(`Aggregator error: ${errorMessage}`);
            console.error('Aggregator error:', error);
        }
        return state;
    }
}
exports.InterviewEvaluator = InterviewEvaluator;
//# sourceMappingURL=index.js.map