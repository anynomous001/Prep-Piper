"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useInterviewWebSocket } from "./use-interview-websocket"
import type { InterviewSession, InterviewQuestion, InterviewResponse } from "@/lib/types"

export type InterviewState = "idle" | "active" | "processing" | "waiting_for_next" | "completed"

export function useInterview() {
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [transcript, setTranscript] = useState<string[]>([])
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [interviewState, setInterviewState] = useState<InterviewState>("idle")
  const [progress, setProgress] = useState(0)
  const [responses, setResponses] = useState<InterviewResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const { isConnected, sendMessage } = useInterviewWebSocket({
    sessionId: session?.id || null,
    onStartInterview: (data) => {
      setCurrentQuestion(data.question)
      setInterviewState("active")
    },
    onInterimTranscript: (data) => {
      setInterimTranscript(data.text)
    },
    onTranscript: (data) => {
      setTranscript((prev) => [...prev, data.text])
      setInterimTranscript("")
      setInterviewState("processing")
    },
    onAudioGenerated: (data) => {
      setAudioUrl(data.audioUrl)
    },
    onInterviewComplete: (data) => {
      setInterviewState("completed")
      setResponses(data.responses)
    },
    onError: (error) => {
      setError(error)
      console.error("WebSocket error:", error)
    },
  })

  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        if (interim && session?.id) {
          sendMessage("interimTranscript", {
            text: interim,
            confidence: event.results[event.results.length - 1][0].confidence,
          })
        }

        if (final && session?.id && currentQuestion?.id) {
          sendMessage("transcript", {
            text: final,
            questionId: currentQuestion.id,
            confidence: event.results[event.results.length - 1][0].confidence,
          })
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
        setError(`Speech recognition error: ${event.error}`)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [session?.id, currentQuestion?.id, sendMessage])

  const initializeMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)

          // Send audio chunk to backend for real-time processing
          if (session?.id) {
            const reader = new FileReader()
            reader.onload = () => {
              sendMessage("audioChunk", {
                chunk: reader.result,
                isLast: false,
              })
            }
            reader.readAsArrayBuffer(event.data)
          }
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        audioChunksRef.current = []

        // Submit final audio to backend
        if (session?.id && currentQuestion?.id) {
          const finalTranscript = transcript[transcript.length - 1] || ""
          const response = await apiClient.submitResponse(session.id, currentQuestion.id, finalTranscript, audioBlob)

          if (response.success && response.data) {
            setResponses((prev) => [...prev, response.data!])
          } else {
            setError(response.error || "Failed to submit response")
          }
        }

        // Send final audio chunk
        if (session?.id) {
          sendMessage("audioChunk", {
            chunk: await audioBlob.arrayBuffer(),
            isLast: true,
          })
        }
      }

      mediaRecorderRef.current = mediaRecorder
    } catch (error) {
      console.error("Failed to initialize media recorder:", error)
      setError("Failed to access microphone")
    }
  }, [session?.id, currentQuestion?.id, transcript, sendMessage])

  const startInterview = useCallback(async () => {
    try {
      setError(null)

      // Create new session
      const sessionResponse = await apiClient.createSession("user-123") // Replace with actual user ID
      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error(sessionResponse.error || "Failed to create session")
      }

      setSession(sessionResponse.data)
      setInterviewState("active")
      setProgress(0)

      // Initialize recognition and recording
      initializeSpeechRecognition()
      await initializeMediaRecorder()

      // Get first question
      const questionResponse = await apiClient.getNextQuestion(sessionResponse.data.id)
      if (questionResponse.success && questionResponse.data) {
        setCurrentQuestion(questionResponse.data)

        // Generate audio for question
        const audioResponse = await apiClient.generateQuestionAudio(questionResponse.data.id)
        if (audioResponse.success && audioResponse.data) {
          setAudioUrl(audioResponse.data.audioUrl)
        }
      }
    } catch (error) {
      console.error("Failed to start interview:", error)
      setError(error instanceof Error ? error.message : "Failed to start interview")
      setInterviewState("idle")
    }
  }, [initializeSpeechRecognition, initializeMediaRecorder])

  const startRecording = useCallback(async () => {
    if (recognitionRef.current && mediaRecorderRef.current && interviewState === "active") {
      setIsRecording(true)
      setInterimTranscript("")
      setError(null)

      recognitionRef.current.start()
      mediaRecorderRef.current.start(1000) // Collect data every second
    }
  }, [interviewState])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setInterviewState("processing")
  }, [isRecording])

  const playAudio = useCallback(() => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setIsPlaying(true)

      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }, [audioUrl])

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const nextQuestion = useCallback(async () => {
    if (!session?.id) return

    try {
      setError(null)
      const questionResponse = await apiClient.getNextQuestion(session.id)

      if (questionResponse.success && questionResponse.data) {
        setCurrentQuestion(questionResponse.data)
        setInterviewState("active")
        setProgress((questionResponse.data.questionIndex + 1) * 20)

        // Generate audio for new question
        const audioResponse = await apiClient.generateQuestionAudio(questionResponse.data.id)
        if (audioResponse.success && audioResponse.data) {
          setAudioUrl(audioResponse.data.audioUrl)
        }
      } else {
        // No more questions, complete interview
        await endInterview()
      }
    } catch (error) {
      console.error("Failed to get next question:", error)
      setError("Failed to load next question")
    }
  }, [session?.id])

  const endInterview = useCallback(async () => {
    if (!session?.id) return

    try {
      await apiClient.endSession(session.id)
      setInterviewState("completed")
      setProgress(100)

      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }

      setIsRecording(false)
      setIsPlaying(false)
    } catch (error) {
      console.error("Failed to end interview:", error)
      setError("Failed to end interview properly")
    }
  }, [session?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  return {
    // State
    session,
    currentQuestion: currentQuestion?.questionText || "",
    transcript,
    interimTranscript,
    isRecording,
    isPlaying,
    audioUrl,
    interviewState,
    progress,
    responses,
    error,
    isConnected,

    // Actions
    startInterview,
    stopRecording,
    startRecording,
    playAudio,
    pauseAudio,
    nextQuestion,
    endInterview,

    // Utilities
    clearError: () => setError(null),
  }
}
