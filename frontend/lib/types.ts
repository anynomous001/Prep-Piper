export interface InterviewSession {
  id: string
  userId: string
  status: "idle" | "active" | "processing" | "waiting_for_next" | "completed"
  currentQuestionIndex: number
  totalQuestions: number
  startedAt: Date
  completedAt?: Date
  progress: number
}

export interface InterviewQuestion {
  id: string
  sessionId: string
  questionIndex: number
  questionText: string
  audioUrl?: string
  generatedAt: Date
}

export interface InterviewResponse {
  id: string
  sessionId: string
  questionId: string
  transcriptText: string
  audioUrl?: string
  feedback?: string
  score?: number
  recordedAt: Date
}

export interface WebSocketMessage {
  type:
    | "startInterview"
    | "interimTranscript"
    | "transcript"
    | "audioGenerated"
    | "interviewComplete"
    | "audioChunk"
    | "error"
  sessionId: string
  data: any
  timestamp: Date
}

export interface StartInterviewData {
  sessionId: string
  question: InterviewQuestion
}

export interface InterimTranscriptData {
  sessionId: string
  text: string
  confidence: number
}

export interface TranscriptData {
  sessionId: string
  text: string
  questionId: string
  confidence: number
}

export interface AudioGeneratedData {
  sessionId: string
  questionId: string
  audioUrl: string
  duration: number
}

export interface InterviewCompleteData {
  sessionId: string
  totalScore: number
  feedback: string
  responses: InterviewResponse[]
}

export interface AudioChunkData {
  sessionId: string
  chunk: ArrayBuffer
  isLast: boolean
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
