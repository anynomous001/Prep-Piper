export type ConnectionState = "disconnected" | "connecting" | "connected" | "error"
export type InterviewState = "idle" | "connecting" | "active" | "processing" | "waiting_for_next" | "completed"

export type TechSelection = {
  position: string
  techs: string[]
  experience: "beginner" | "intermediate" | "advanced"
}

export type TranscriptState = {
  interim: string
  final: string[]
}
