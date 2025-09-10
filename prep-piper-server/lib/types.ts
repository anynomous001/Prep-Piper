export type ConnectionState = "disconnected" | "connecting" | "connected" | "error"
export type InterviewState = "idle" | "connecting" | "active" | "processing" | "waiting_for_next" | "completed"

export type TechSelection = {
  position: string
  techs: string[]
  experience: "beginner" | "intermediate" | "advanced"
}

// lib/types.ts
export interface Message {
  role: "interviewer" | "candidate"
  text: string
  timestamp: Date
}

export interface TranscriptState {
  messages: Message[]
  interim: string
}


export interface EvaluationData {
  success: boolean
  evaluation_id: string
  duration_ms: number
  timestamp: string
  data: {
    overall_score: number
    recommendation: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire"
    key_strengths: string[]
    critical_weaknesses: string[]
    development_areas: string[]
    technical_skills: Array<{
      skill_name: string
      proficiency_level: "beginner" | "intermediate" | "advanced" | "expert"
      evidence: string[]
      confidence: "low" | "medium" | "high" | "very_high"
      comments: string
    }>
    problem_solving_instances: Array<{
      problem_statement: string
      solution: string
      approach_quality: number
      solution_effectiveness: number
      reasoning_clarity: number
    }>
    position_evaluated_for: string
    evaluation_timestamp: string
    current_step: string
    errors: string[]
  }
}