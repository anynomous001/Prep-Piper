// interview-langgraph.ts
import { config } from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import {
    EvaluationWorkFlowState,
    ProblemSolvingOutputSchema,
    TechnicalEvaluationOutputSchema,
    TechnicalSkillAssessmentSchema,
    FinalReportOutputSchema,
    InterviewData
} from '../schemas/schema';
import { demoInterviewData } from "../data/data";





// ✅ SINGLE STATE DECLARATION - Just like Python example
const WorkflowState = Annotation.Root({
    // Core data
    interview_data: Annotation(),
    current_step: Annotation(),
    
    // Separate step tracking for parallel nodes (avoids conflicts)
    technical_step: Annotation({
        reducer: (x: string, y: string) => y || x,
        default: () => "pending"
    }),
    problem_solving_step: Annotation({
        reducer: (x: string, y: string) => y || x,
        default: () => "pending"
    }),
    
    // Arrays with proper reducers
    errors: Annotation({
        reducer: (x: string[], y: string[]) => x.concat(y),
        default: () => []
    }),
    
    // Problem solving fields
    problem_solving_instances: Annotation({
        reducer: (x: any[], y: any[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    problem_solving_score: Annotation({
        reducer: (x: number, y: number) => y || x,
        default: () => 0
    }),
    analytical_thinking_score: Annotation({
        reducer: (x: number, y: number) => y || x,
        default: () => 0
    }),
    debugging_potential_score: Annotation({
        reducer: (x: number, y: number) => y || x,
        default: () => 0
    }),
    problem_solving_approach: Annotation({
        reducer: (x: string, y: string) => y || x,
        default: () => ""
    }),
    
    // Technical skills fields
    technical_skills: Annotation({
        reducer: (x: any[], y: any[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    technical_consistency_score: Annotation({
        reducer: (x: number, y: number) => y || x,
        default: () => 0
    }),
    technical_depth_score: Annotation({
        reducer: (x: number, y: number) => y || x,
        default: () => 0
    }),
    technical_knowledge_gaps: Annotation({
        reducer: (x: string[], y: string[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    technical_strengths: Annotation({
        reducer: (x: string[], y: string[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    
    // Final assessment fields
    overall_score: Annotation({
        reducer: (x: number, y: number) => y || x,
        default: () => 0
    }),
    key_strengths: Annotation({
        reducer: (x: string[], y: string[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    critical_weaknesses: Annotation({
        reducer: (x: string[], y: string[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    recommendation: Annotation<"Strong Hire" | "Hire" | "No Hire" | "Strong No Hire">({
        reducer: (x, y) => y || x,
        default: () => "No Hire" as const
    }),
    development_areas: Annotation({
        reducer: (x: string[], y: string[]) => y.length > 0 ? y : x,
        default: () => []
    }),
    
    // Metadata
    evaluation_timestamp: Annotation(),
    candidate_id: Annotation(),
    position_evaluated_for: Annotation({
        reducer: (x: string, y: string) => y || x,
        default: () => "Frontend Developer"
    })
});
 config();
// ✅ SINGLE LLM INSTANCE
function loadEnvironment(): boolean {
    try {
        config();
        const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
        if (!apiKey) {
            console.log("❌ API key not found in environment");
            return false;
        }
        console.log("✓ Environment variables loaded");
        return true;
    } catch (error) {
        console.log(`❌ Error loading environment: ${error}`);
        return false;
    }
}

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    maxRetries: 2
});

// ✅ DIRECT NODE FUNCTIONS - No wrapper class needed
async function technicalEvaluationNode(state: typeof WorkflowState.State): Promise<Partial<typeof WorkflowState.State>> {
    console.log('🔧 Technical Skills Evaluation started');

    try {
        const systemPrompt = `You are a Senior Technical Interviewer specializing in evaluating technical skills and knowledge depth.

Your task is to analyze the interview conversation and assess the candidate's technical competencies.

Focus on:
1. Depth of technical understanding
2. Specific skills demonstrated (HTML, CSS, JavaScript, frameworks, etc.)
3. Quality of technical explanations
4. Knowledge gaps and areas needing improvement

Return your analysis in JSON format with the following structure:
{
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
            new SystemMessage(systemPrompt),
            new HumanMessage(humanPrompt)
        ];

        const structuredLlm = llm.withStructuredOutput(TechnicalEvaluationOutputSchema);
        const response = await structuredLlm.invoke(messages);

        console.log("✅ Technical evaluation completed");

        return {
            technical_skills: response?.technical_skills?.map(skill => 
                TechnicalSkillAssessmentSchema.parse(skill)
            ) || [],
            technical_consistency_score: response.technical_consistency_score || 0,
            technical_depth_score: response.technical_depth_score || 0,
            technical_knowledge_gaps: response.technical_knowledge_gaps || [],
            technical_strengths: response.technical_strengths || [],
            technical_step: "completed"
        };
    } catch (error) {
        console.error("❌ Technical evaluation failed:", error);
        return {
            errors: [`Technical evaluation failed: ${error instanceof Error ? error.message : String(error)}`],
            technical_step: "failed"
        };
    }
}

async function problemSolvingEvaluationNode(state: typeof WorkflowState.State): Promise<Partial<typeof WorkflowState.State>> {
    console.log('🎯 Problem Solving Evaluation started');

    try {
        const systemPrompt = `You are a senior software developer specialized in evaluating problem solving abilities and implementation abilities.

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
  "problem_solving_instances": [{
    "problem_statement": "E-commerce real-time inventory challenge",
    "solution": "Implemented a live websocket based live inventory tracking system integrated with redis for fast cache updates",
    "approach_quality": 9,
    "solution_effectiveness": 8,
    "reasoning_clarity": 9
  }],
  "problem_solving_score": 6,
  "analytical_thinking_score": 8,
  "debugging_potential_score": 7,
  "problem_solving_approach": "Systematic approach with consideration of real-world constraints"
}

Evaluate specific instances where the candidate solved problems or explained their approach.`;

        const humanPrompt = `Analyze this interview conversation for problem-solving and implementation abilities:

Interview Data: ${JSON.stringify(state.interview_data)}

Return only valid JSON following the specified structure.`;

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(humanPrompt)
        ];

        const structuredLlm = llm.withStructuredOutput(ProblemSolvingOutputSchema);
        const response = await structuredLlm.invoke(messages);

        console.log("✅ Problem solving evaluation completed");

        return {
            problem_solving_instances: response.problem_solving_instances || [],
            problem_solving_score: response.problem_solving_score || 0,
            problem_solving_approach: response.problem_solving_approach || "",
            debugging_potential_score: response.debugging_potential_score || 0,
            analytical_thinking_score: response.analytical_thinking_score || 0,
            problem_solving_step: "completed"
        };
    } catch (error) {
        console.error("❌ Problem solving evaluation failed:", error);
        return {
            errors: [`Problem solving evaluation failed: ${error instanceof Error ? error.message : String(error)}`],
            problem_solving_step: "failed"
        };
    }
}

async function aggregationNode(state: typeof WorkflowState.State): Promise<Partial<typeof WorkflowState.State>> {
    console.log('📊 Aggregation started');

    try {
        // Check if both evaluations completed
        const hasFailures = state.technical_step === "failed" || state.problem_solving_step === "failed";
        
        if (hasFailures) {
            console.warn("⚠️ Skipping aggregation due to evaluation failures");
            return {
                current_step: "aggregation_skipped"
            };
        }

        // Validation of required fields
        if (state.technical_skills.length === 0 || state.technical_consistency_score === 0) {
            return {
                errors: ["Aggregator: Not all evaluations completed successfully"],
                current_step: "aggregation_failed"
            };
        }

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
                overall_score: state.problem_solving_score
            },
            original_interview: state.interview_data
        };

        const systemPrompt = `You are a Senior Hiring Manager with expertise in technical recruitment and candidate assessment.

Your task is to synthesize evaluations from multiple specialist areas into a comprehensive final assessment.

Create a final evaluation that:
- Calculates weighted overall score (0-10 scale)
- Identifies key strengths and critical weaknesses  
- Provides clear hiring recommendation
- Gives actionable development areas

Return JSON with this structure:
{
  "overall_score": 8.1,
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
            new SystemMessage(systemPrompt),
            new HumanMessage(humanPrompt)
        ];

        const structuredLlm = llm.withStructuredOutput(FinalReportOutputSchema);
        const response = await structuredLlm.invoke(messages);

        console.log('🔍 Aggregation LLM result:', JSON.stringify(response, null, 2));
        console.log("✅ Aggregation completed");

        // ✅ FIX: Use LLM results directly, don't override!
        return {
            overall_score: response.overall_score || 0,
            key_strengths: response.key_strengths || [],
            critical_weaknesses: response.critical_weaknesses || [],
            recommendation: response.recommendation, // ✅ Use LLM recommendation!
            development_areas: response.development_areas || [],
            evaluation_timestamp: new Date().toISOString(),
            candidate_id: (state.interview_data as any)?.candidate_id || "unknown",
            current_step: "completed"
        };
    } catch (error) {
        console.error("❌ Aggregation failed:", error);
        return {
            errors: [`Aggregation failed: ${error instanceof Error ? error.message : String(error)}`],
            current_step: "aggregation_failed"
        };
    }
}

// ✅ BUILD GRAPH ONCE - Just like Python example
function buildGraph() {
  const workflow = new StateGraph(WorkflowState);

  // Register nodes
  workflow.addNode("technical_evaluation", technicalEvaluationNode as any);
  workflow.addNode("problem_solving_evaluation", problemSolvingEvaluationNode as any);
  workflow.addNode("aggregation", aggregationNode as any);

  // 1. START -> technical_evaluation
  //@ts-ignore
  workflow.addEdge(START,"technical_evaluation");

  // 2. START -> problem_solving_evaluation
    //@ts-ignore

  workflow.addEdge(START,"problem_solving_evaluation");

  // 3. technical_evaluation -> aggregation
    //@ts-ignore
  workflow.addEdge("technical_evaluation", "aggregation");

  // 4. problem_solving_evaluation -> aggregation
    //@ts-ignore

  workflow.addEdge("problem_solving_evaluation", "aggregation");

  // 5. aggregation -> END
    //@ts-ignore

  workflow.addEdge("aggregation", END);

  return workflow.compile();
}



// ✅ MAIN EXECUTION FUNCTION
export async function runInterviewEvaluation(providedInitialState?: any) {
    console.log("🚀 Starting Interview Evaluation Workflow");
    console.log("✅ Single State Declaration");
    console.log("✅ Direct Node Functions");
    console.log("✅ True Parallel Execution");

    if (!loadEnvironment()) {
        throw new Error("Environment setup failed");
    }
    
    const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    maxRetries: 2
  });
    const graph = buildGraph();

    // Initial state
    const initialState = providedInitialState || {
        interview_data: demoInterviewData as InterviewData,
        current_step: "initialization",
        technical_step: "pending",
        problem_solving_step: "pending",
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
        position_evaluated_for: demoInterviewData.position,
        recommendation: "No Hire" as const,
        development_areas: [],
        evaluation_timestamp: "",
        candidate_id: "unknown"
    };

    console.log("⚡ Starting parallel evaluation...");
    const startTime = Date.now();

    try {
        const result = await graph.invoke(initialState);
        const duration = Date.now() - startTime;

        console.log(`🎉 Workflow completed in ${duration}ms`);

        console.log("\n🎯 FINAL EVALUATION RESULTS:");
        console.log("=".repeat(60));
        console.log(`Overall Score: ${result.overall_score}/10`);
        console.log(`Recommendation: ${result.recommendation}`); // ✅ Should now show LLM result
        console.log(`Technical Step: ${result.technical_step}`);
        console.log(`Problem Step: ${result.problem_solving_step}`);
        console.log(`Final Status: ${result.current_step}`);
        console.log(`Technical Skills: ${result.technical_skills?.length || 0} assessed`);
        console.log(`Problem Instances: ${result.problem_solving_instances?.length || 0} found`);
        console.log(`Key Strengths: ${result.key_strengths?.join(', ') || 'None'}`);
        console.log(`Critical Weaknesses: ${result.critical_weaknesses?.join(', ') || 'None'}`);
        console.log(`Errors: ${result.errors.length}`);

        return result;
    } catch (error) {
        console.error("💥 Workflow failed:", error);
        throw error;
    }
}

// Optional: Generate workflow visualization
export async function visualizeWorkflow() {
    const graph = buildGraph();
    
    try {
        const graphImage = await graph.getGraph().drawMermaidPng();
        
        if (typeof window !== 'undefined') {
            // Browser
            const url = URL.createObjectURL(graphImage);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'interview-evaluation-workflow.png';
            a.click();
        } else {
            // Node.js
            const fs = require('fs');
            const buffer = Buffer.from(await graphImage.arrayBuffer());
            fs.writeFileSync('./interview-evaluation-workflow.png', buffer);
        }
        
        console.log("📈 Workflow diagram generated");
    } catch (error : any) {
        console.warn("Could not generate diagram:", error.message);
    }
}
