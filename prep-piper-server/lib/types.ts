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
