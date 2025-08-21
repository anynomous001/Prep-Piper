"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useInterviewWebSocket } from "./use-interview-websocket"
import type {
  InterviewSession,
  InterviewQuestion,
  InterviewResponse,
} from "@/lib/types"

export type InterviewState =
  | "idle"
  | "active"
  | "processing"
  | "waiting_for_next"
  | "completed"

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

  const {
    connect,
    isConnected,
    sendMessage,
  } = useInterviewWebSocket({
    sessionId: session?.id || null,
    
    onSttConnected: ({ sessionId }) => {
      console.log("STT is now connected for", sessionId)
      setInterviewState("active")
    },

    onStartInterview: ({ sessionId, question }) => {
      // Build session object
      const newSession: InterviewSession = {
        id: sessionId,
        userId: "user-123",
        status: "active",
        currentQuestionIndex: 0,
        totalQuestions: 5,
        startedAt: new Date(),
        progress: 20,
      }
      setSession(newSession)
      setCurrentQuestion(question)
      setInterviewState("active")
      setProgress(20)
      initializeSpeechRecognition()
      initializeMediaRecorder()
    },

    onInterviewStarted: ({ sessionId, question }) => {
      // Handle backend's interviewStarted event
      const newSession: InterviewSession = {
        id: sessionId,
        userId: "user-123",
        status: "active",
        currentQuestionIndex: 0,
        totalQuestions: 5,
        startedAt: new Date(),
        progress: 20,
      }
      setSession(newSession)
      setCurrentQuestion(question)
      setInterviewState("active")
      setProgress(20)
      initializeSpeechRecognition()
      initializeMediaRecorder()
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
      setInterviewState("waiting_for_next")
    },
    onInterviewComplete: (data) => {
      setInterviewState("completed")
      setProgress(100)
      if (data.responses) {
        setResponses(data.responses)
      }
      cleanup()
    },
    onError: (err) => {
      setError(err)
      console.error("WebSocket error:", err)
    },
  })

  // Auto-start interview from preferences
  useEffect(() => {
    const preferences = localStorage.getItem('interviewPreferences')
    if (preferences && interviewState === 'idle') {
      const { sessionId, techStack, position } = JSON.parse(preferences)
      console.log("Auto-starting interview with preferences:", { sessionId, techStack, position })
      
      startInterview(techStack, position)
      localStorage.removeItem('interviewPreferences')
    }
  }, [interviewState])

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
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += t
          } else {
            interim += t
          }
        }
        if (interim && session?.id) {
          sendMessage("interimTranscript", {
            text: interim,
            confidence: event.results[event.results.length - 1][0].confidence,
          })
        }
        if (final && session?.id) {
          sendMessage("transcript", {
            text: final,
            confidence: event.results[event.results.length - 1][0].confidence,
          })
        }
      }

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error)
        setIsRecording(false)
        setError(`Speech recognition error: ${e.error}`)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [session?.id, sendMessage])

  const initializeMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
          if (session?.id) {
            const reader = new FileReader()
            reader.onload = () => {
              sendMessage("audioChunk", {
                chunk: reader.result,
                isLast: false,
              })
            }
            reader.readAsArrayBuffer(e.data)
          }
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        })
        audioChunksRef.current = []
        if (session?.id) {
          sendMessage("audioChunk", {
            chunk: await blob.arrayBuffer(),
            isLast: true,
          })
        }
      }

      mediaRecorderRef.current = recorder
    } catch (e) {
      console.error("Failed to init recorder:", e)
      setError("Failed to access microphone")
    }
  }, [session?.id, sendMessage])

  const startInterview = useCallback(
    async (
      techStack = "JavaScript, React, Node.js",
      position = "Software Developer"
    ) => {
      setError(null)
      setInterviewState("active")
      await connect()
      sendMessage("startInterview", { techStack, position })
    },
    [connect, sendMessage]
  )

  const startRecording = useCallback(() => {
    if (
      recognitionRef.current &&
      mediaRecorderRef.current &&
      interviewState === "active"
    ) {
      setIsRecording(true)
      setInterimTranscript("")
      setError(null)
      recognitionRef.current.start()
      mediaRecorderRef.current.start(1000)
    }
  }, [interviewState])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
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

  const nextQuestion = useCallback(() => {
    setInterviewState("waiting_for_next")
    setProgress((p) => Math.min(p + 20, 100))
  }, [])

  const endInterview = useCallback(() => {
    setInterviewState("completed")
    setProgress(100)
    cleanup()
  }, [])

  const cleanup = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop()
    }
    if (audioRef.current) audioRef.current.pause()
    setIsRecording(false)
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
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

    startInterview,
    stopRecording,
    startRecording,
    playAudio,
    pauseAudio,
    nextQuestion,
    endInterview,

    clearError: () => setError(null),
  }
}
