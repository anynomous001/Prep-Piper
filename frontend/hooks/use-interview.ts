"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import type {
  InterviewSession,
  InterviewQuestion,
  InterviewResponse,
} from "@/lib/types"

export type InterviewState =
  | "idle"
  | "connecting"
  | "active"
  | "processing"
  | "waiting_for_next"
  | "completed"

// Singleton WebSocket connection to prevent React Strict Mode issues
class SingletonSocket {
  private static instance: Socket | null = null
  private static connecting = false

  static async getInstance(): Promise<Socket> {
    if (SingletonSocket.instance?.connected) {
      return SingletonSocket.instance
    }
    if (SingletonSocket.connecting) {
      return new Promise((resolve) => {
        const check = () => {
          if (SingletonSocket.instance?.connected) {
            resolve(SingletonSocket.instance!)
          } else if (!SingletonSocket.connecting) {
            SingletonSocket.getInstance().then(resolve)
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })
    }
    SingletonSocket.connecting = true
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
      if (SingletonSocket.instance) {
        SingletonSocket.instance.removeAllListeners()
        SingletonSocket.instance.disconnect()
      }
      SingletonSocket.instance = io(wsUrl, {
        transports: ["websocket"],
        timeout: 10000,
        autoConnect: false,
        forceNew: true,
      })
      return new Promise((resolve, reject) => {
        const socket = SingletonSocket.instance!
        const timeout = setTimeout(() => {
          SingletonSocket.connecting = false
          reject(new Error("Connection timeout"))
        }, 10000)
        socket.on("connect", () => {
          clearTimeout(timeout)
          SingletonSocket.connecting = false
          console.log("✅ Singleton socket connected")
          resolve(socket)
        })
        socket.on("connect_error", (err) => {
          clearTimeout(timeout)
          SingletonSocket.connecting = false
          console.error("❌ Singleton socket error:", err)
          reject(err)
        })
        socket.connect()
      })
    } catch (err) {
      SingletonSocket.connecting = false
      throw err
    }
  }

  static disconnect(): void {
    if (SingletonSocket.instance) {
      SingletonSocket.instance.removeAllListeners()
      SingletonSocket.instance.disconnect()
      SingletonSocket.instance = null
    }
    SingletonSocket.connecting = false
  }
}

export function useInterview() {
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [transcript, setTranscript] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [interviewState, setInterviewState] = useState<InterviewState>("idle")
  const [progress, setProgress] = useState(0)
  const [responses, setResponses] = useState<InterviewResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const socketRef = useRef<Socket | null>(null)
  const handlersSet = useRef(false)
  const isRecordingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up media resources
  const cleanup = useCallback(() => {
    console.log("🧹 Cleaning up media resources")
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop() } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsRecording(false)
    setIsPlaying(false)
    isRecordingRef.current = false
  }, [])

  // Setup Socket event handlers once
  const setupHandlers = useCallback((socket: Socket) => {
    if (handlersSet.current) return
    console.log("🔧 Setting up socket handlers")

    socket.on("connect", () => {
      console.log("✅ Socket connected")
      setIsConnected(true)
    })
    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected")
      setIsConnected(false)
      handlersSet.current = false
    })
    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err)
      setError(`Connection error: ${err.message}`)
      setIsConnected(false)
    })

    socket.on("interviewStarted", ({ sessionId, question }) => {
      console.log("🎯 interviewStarted:", sessionId)
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
  setCurrentQuestion({ sessionId, questionIndex: 1, questionText: question.questionText, generatedAt: new Date(), id: `q-${sessionId}-1` })
      setProgress(20)
      setInterviewState("active")
    })

    socket.on("interimTranscript", (data) => {
      console.log("📝 interimTranscript:", data.text)
    })

    socket.on("transcript", (data) => {
      console.log("✅ final transcript:", data.text)
      setTranscript((prev) => [...prev, data.text])
      setInterviewState("processing")
    })

    socket.on("nextQuestion", ({ question }) => {
      console.log("❓ nextQuestion:", question)
      setCurrentQuestion((prev) => prev && ({
        ...prev,
        questionIndex: prev.questionIndex + 1,
        questionText: question,
        id: `q-${prev.sessionId}-${prev.questionIndex+1}`
      }))
      setProgress((p) => Math.min(p + 20, 100))
      setInterviewState("waiting_for_next")
    })

    socket.on("audioGenerated", (data) => {
      console.log("🔊 audioGenerated:", data.audioUrl)
      setAudioUrl(data.audioUrl)
      setInterviewState("waiting_for_next")
      setIsPlaying(false)
      setTimeout(() => {
        playAudio(data.audioUrl)
      }, 500)
    })

    socket.on("interviewComplete", (data) => {
      console.log("🏁 interviewComplete")
      setInterviewState("completed")
      setProgress(100)
      setResponses(data.responses || [])
      cleanup()
    })

    socket.on("error", (err) => {
      console.error("❌ interview error:", err)
      setError(typeof err === "string" ? err : err.error || "Unknown error")
    })

    handlersSet.current = true
  }, [cleanup])

  // Connect socket
  const connectSocket = useCallback(async () => {
    if (socketRef.current?.connected) return socketRef.current
    const socket = await SingletonSocket.getInstance()
    socketRef.current = socket
    setupHandlers(socket)
    return socket
  }, [setupHandlers])

  // Initialize MediaRecorder
  const initRecorder = useCallback(async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    console.log("🎤 Requesting microphone access...")
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    })
    mediaStreamRef.current = stream
    console.log("✅ Microphone access granted")

    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm"
    })

    recorder.ondataavailable = (e) => {
      console.log("📤 chunk size", e.data.size)
      if (e.data.size > 0 && socketRef.current?.connected && session) {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            socketRef.current!.emit("audioChunk", {
              sessionId: session.id,
              audioData: Array.from(new Uint8Array(reader.result as ArrayBuffer))
            })
            console.log("📤 emitted audioChunk")
          }
        }
        reader.readAsArrayBuffer(e.data)
      }
    }

    recorder.onstart = () => {
      console.log("🎤 Media recorder started")
      audioChunksRef.current = []
    }

    recorder.onstop = () => {
      console.log("🎤 Media recorder stopped")
      socketRef.current?.emit("finalizeAudio", { sessionId: session!.id })
      console.log("🛑 emitted finalizeAudio")
    }

    recorder.onerror = (e) => {
      console.error("Recorder error:", e)
      setError("Recording error")
      setIsRecording(false)
      isRecordingRef.current = false
    }

    mediaRecorderRef.current = recorder
    console.log("✅ Media recorder initialized")
  }, [session])

  // Start interview
  const startInterview = useCallback(async (techStack = "JS, React", position = "Dev") => {
    setError(null)
    setInterviewState("connecting")
    try {
      console.log("🔌 Connecting to server...")
      const socket = await connectSocket()
      console.log("📤 startInterview")
      socket.emit("startInterview", { techStack, position })
      await initRecorder()
      setInterviewState("active")
    } catch (err) {
      console.error("❌ startInterview failed", err)
      setError("Failed to start")
      setInterviewState("idle")
    }
  }, [connectSocket, initRecorder])

  // Start recording
  const startRecording = useCallback(() => {
    if (isRecordingRef.current || !mediaRecorderRef.current) return
    console.log("🎤 startRecording()")
    mediaRecorderRef.current.start(250)
    setIsRecording(true)
    isRecordingRef.current = true
    timeoutRef.current = setTimeout(() => {
      console.log("⏰ recording timeout")
      stopRecording()
    }, 30000)
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current || !mediaRecorderRef.current) return
    console.log("🛑 stopRecording()")
    clearTimeout(timeoutRef.current!)
    mediaRecorderRef.current.stop()
    setIsRecording(false)
    setInterviewState("processing")
    isRecordingRef.current = false
  }, [])

  // Play audio
  const playAudio = useCallback((url?: string) => {
    const src = url || audioUrl
    if (!src) return
    console.log("🔊 playAudio()", src)
    audioRef.current?.pause()
    audioRef.current = new Audio(src)
    audioRef.current.play().then(() => setIsPlaying(true))
    audioRef.current.onended = () => {
      setIsPlaying(false)
      console.log("🔊 Audio playback completed")
    }
    audioRef.current.onerror = (e) => {
      console.error("Audio playback error", e)
      setError("Playback error")
    }
  }, [audioUrl])

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const nextQuestion = useCallback(() => {
    setInterviewState("waiting_for_next")
    setProgress((p) => Math.min(p + 20, 100))
  }, [])

  const endInterview = useCallback(() => {
    if (session?.id && socketRef.current?.connected) {
      socketRef.current.emit("endInterview", { sessionId: session.id })
    }
    setInterviewState("completed")
    setProgress(100)
    cleanup()
  }, [session, cleanup])

  useEffect(() => cleanup, [cleanup])

  return {
    session,
    currentQuestion: currentQuestion?.questionText || "",
    transcript,
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
