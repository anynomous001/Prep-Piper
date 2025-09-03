// "use client"

// import { useState, useCallback, useRef, useEffect } from "react"
// import { io, Socket } from "socket.io-client"
// import type {
//   InterviewSession,
//   InterviewQuestion,
//   InterviewResponse,
// } from "@/lib/types"

// export type InterviewState =
//   | "idle"
//   | "connecting"
//   | "active"
//   | "processing"
//   | "waiting_for_next"
//   | "completed"

// // Singleton WebSocket connection to prevent React Strict Mode issues
// class SingletonSocket {
//   private static instance: Socket | null = null
//   private static connecting = false

//   static async getInstance(): Promise<Socket> {
//     if (SingletonSocket.instance?.connected) {
//       return SingletonSocket.instance
//     }

//     if (SingletonSocket.connecting) {
//       // Wait for the current connection attempt
//       return new Promise((resolve) => {
//         const checkConnection = () => {
//           if (SingletonSocket.instance?.connected) {
//             resolve(SingletonSocket.instance)
//           } else if (!SingletonSocket.connecting) {
//             // Connection failed, try again
//             SingletonSocket.getInstance().then(resolve)
//           } else {
//             setTimeout(checkConnection, 100)
//           }
//         }
//         checkConnection()
//       })
//     }

//     SingletonSocket.connecting = true
//     try {
//       const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
//       if (SingletonSocket.instance) {
//         SingletonSocket.instance.removeAllListeners()
//         SingletonSocket.instance.disconnect()
//       }

//       SingletonSocket.instance = io(wsUrl, {
//         transports: ['websocket'],
//         timeout: 10000,
//         autoConnect: false,
//         forceNew: true,
//       })

//       return new Promise((resolve, reject) => {
//         const socket = SingletonSocket.instance!
//         const connectTimeout = setTimeout(() => {
//           SingletonSocket.connecting = false
//           reject(new Error('Connection timeout'))
//         }, 10000)

//         socket.on('connect', () => {
//           clearTimeout(connectTimeout)
//           SingletonSocket.connecting = false
//           console.log('✅ Singleton socket connected')
//           resolve(socket)
//         })

//         socket.on('connect_error', (error) => {
//           clearTimeout(connectTimeout)
//           SingletonSocket.connecting = false
//           console.error('❌ Singleton socket connection error:', error)
//           reject(error)
//         })

//         socket.connect()
//       })
//     } catch (error) {
//       SingletonSocket.connecting = false
//       throw error
//     }
//   }

//   static disconnect(): void {
//     if (SingletonSocket.instance) {
//       SingletonSocket.instance.removeAllListeners()
//       SingletonSocket.instance.disconnect()
//       SingletonSocket.instance = null
//     }
//     SingletonSocket.connecting = false
//   }
// }

// export function useInterview() {
//   const [session, setSession] = useState<InterviewSession | null>(null)
//   const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
//   const [transcript, setTranscript] = useState<string[]>([])
//   const [interimTranscript, setInterimTranscript] = useState("")
//   const [isRecording, setIsRecording] = useState(false)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [audioUrl, setAudioUrl] = useState<string | null>(null)
//   const [interviewState, setInterviewState] = useState<InterviewState>("idle")
//   const [progress, setProgress] = useState(0)
//   const [responses, setResponses] = useState<InterviewResponse[]>([])
//   const [error, setError] = useState<string | null>(null)
//   const [isConnected, setIsConnected] = useState(false)

//   const audioRef = useRef<HTMLAudioElement | null>(null)
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const mediaStreamRef = useRef<MediaStream | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])
//   const socketRef = useRef<Socket | null>(null)
//   const eventHandlersSetup = useRef(false)
//   const isRecordingRef = useRef(false) // Track recording state to prevent double starts
//   const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

//   const cleanup = useCallback(() => {
//     console.log('🧹 Cleaning up media resources...')
    
//     // Clear any recording timeouts
//     if (recordingTimeoutRef.current) {
//       clearTimeout(recordingTimeoutRef.current)
//       recordingTimeoutRef.current = null
//     }

//     // Stop media recorder
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       try {
//         mediaRecorderRef.current.stop()
//       } catch (e) {
//         console.log('Media recorder already stopped')
//       }
//     }

//     // Stop media stream tracks
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach(track => {
//         track.stop()
//         console.log('🎤 Media track stopped:', track.kind)
//       })
//       mediaStreamRef.current = null
//     }

//     // Stop audio playback
//     if (audioRef.current) {
//       audioRef.current.pause()
//       audioRef.current = null
//     }

//     setIsRecording(false)
//     setIsPlaying(false)
//     isRecordingRef.current = false
//   }, [])

//   const setupEventHandlers = useCallback((socket: Socket) => {
//     if (eventHandlersSetup.current) {
//       return
//     }

//     console.log('🔧 Setting up interview event handlers')

//     // Connection events
//     socket.on('connect', () => {
//       console.log('✅ Interview socket connected')
//       setIsConnected(true)
//     })

//     socket.on('disconnect', () => {
//       console.log('🔌 Interview socket disconnected')
//       setIsConnected(false)
//       eventHandlersSetup.current = false
//     })

//     socket.on('connect_error', (error) => {
//       console.error('❌ Interview socket connection error:', error)
//       setError(`Connection error: ${error.message}`)
//       setIsConnected(false)
//     })

//     // STT events
//     socket.on('sttConnected', ({ sessionId }) => {
//       console.log("🎤 STT connected for session:", sessionId)
//     })

//     // Interview events
//     socket.on('interviewStarted', ({ sessionId, question }) => {
//       console.log("🎯 Interview started:", { sessionId, question })
//       const newSession: InterviewSession = {
//         id: sessionId,
//         userId: "user-123",
//         status: "active",
//         currentQuestionIndex: 0,
//         totalQuestions: 5,
//         startedAt: new Date(),
//         progress: 20,
//       }

//       setSession(newSession)
//       if (question?.questionText) {
//         setCurrentQuestion({
//           id: `q-${sessionId}-1`,
//           sessionId,
//           questionIndex: 1,
//           questionText: question.questionText,
//           generatedAt: new Date(),
//         })
//       }

//       setProgress(20)
//       setInterviewState("active")
//     })

//     socket.on('interimTranscript', (data) => {
//       console.log("🎤 Interim transcript:", data.text)
//       setInterimTranscript(data.text)
//     })

//     socket.on('transcript', (data) => {
//       console.log("📝 Final transcript received:", data.text)
//       setTranscript((prev) => [...prev, data.text])
//       setInterimTranscript("")
//       setInterviewState("processing")
//     })

//     socket.on('nextQuestion', ({ sessionId, question }) => {
//       console.log("❓ Next question received:", question)
//       if (session?.id === sessionId) {
//         setCurrentQuestion(prev => ({
//           id: `q-${sessionId}-${(prev?.questionIndex || 0) + 1}`,
//           sessionId,
//           questionIndex: (prev?.questionIndex || 0) + 1,
//           questionText: question,
//           generatedAt: new Date(),
//         }))
//         setProgress(prev => Math.min(prev + 20, 100))
//         setInterviewState("waiting_for_next")
//       }
//     })

//     socket.on('audioGenerated', (data) => {
//       console.log("🔊 Audio generated:", data)
//       setAudioUrl(data.audioUrl)
//       setInterviewState("waiting_for_next")
//       setIsPlaying(false)
//       // Auto-play the generated audio
//       if (data.audioUrl) {
//         setTimeout(() => {
//           playAudio(data.audioUrl)
//         }, 500)
//       }
//     })

//     socket.on('interviewComplete', (data) => {
//       console.log("🏁 Interview completed:", data)
//       setInterviewState("completed")
//       setProgress(100)
//       if (data.responses) {
//         setResponses(data.responses)
//       }
//       cleanup()
//     })

//     socket.on('error', (err) => {
//       console.error("❌ Interview error:", err)
//       setError(typeof err === 'string' ? err : err.error || 'Unknown error')
//     })

//     eventHandlersSetup.current = true
//   }, [cleanup, session?.id])

//   // Auto-start interview from preferences - Only run once
//   useEffect(() => {
//     if (typeof window === 'undefined') return
//     const preferences = localStorage.getItem('interviewPreferences')
//     if (preferences && interviewState === 'idle') {
//       const { techStack, position } = JSON.parse(preferences)
//       console.log("🚀 Auto-starting interview with preferences:", { techStack, position })
//       startInterview(techStack, position)
//       localStorage.removeItem('interviewPreferences')
//     }
//   }, []) // Empty dependency array - only run on mount

//   const connectSocket = useCallback(async (): Promise<Socket> => {
//     if (socketRef.current?.connected) {
//       return socketRef.current
//     }

//     try {
//       const socket = await SingletonSocket.getInstance()
//       socketRef.current = socket
//       setupEventHandlers(socket)
//       return socket
//     } catch (error) {
//       console.error('Failed to connect socket:', error)
//       throw error
//     }
//   }, [setupEventHandlers])

//   const initializeMediaRecorder = useCallback(async () => {
//     try {
//       // Clean up existing media stream
//       if (mediaStreamRef.current) {
//         mediaStreamRef.current.getTracks().forEach(track => track.stop())
//       }

//       console.log('🎤 Requesting microphone access...')
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           sampleRate: 16000,
//           channelCount: 1,
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       })
      
//       mediaStreamRef.current = stream
//       console.log('✅ Microphone access granted')

//       const recorder = new MediaRecorder(stream, {
//         mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
//           ? 'audio/webm;codecs=opus'
//           : 'audio/webm',
//       })

//       recorder.ondataavailable = (e) => {
//           console.log(`📤 [Frontend] ondataavailable — chunk size ${e.data.size}`);

//         if (e.data.size > 0) {
//           audioChunksRef.current.push(e.data)
//           if (session?.id && socketRef.current?.connected) {
//             const reader = new FileReader()
//             reader.onload = () => {
//               if (reader.result) {
//                 socketRef.current?.emit("audioChunk", {
//                   sessionId: session.id,
//                   audioData: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
//                 })
//                  console.log('📤 [Frontend] emitted audioChunk');
//               }
//             }
//             reader.readAsArrayBuffer(e.data)
//           }
//         }
//       }

//       recorder.onstart = () => {
//         console.log('🎤 Media recorder started')
//         audioChunksRef.current = []
//         setError(null)
//       }

//       recorder.onstop = async () => {
//         console.log('🎤 Media recorder stopped')
//         const blob = new Blob(audioChunksRef.current, {
//           type: recorder.mimeType,
//         })
//         audioChunksRef.current = []
        
//         if (session?.id && socketRef.current?.connected) {
//           console.log('📤 Finalizing audio for session:', session.id)
//           socketRef.current.emit("finalizeAudio", {
//             sessionId: session.id,
//           })
//         }
//       }

//       recorder.onerror = (e) => {
//         console.error('Media recorder error:', e)
//         setError('Recording error occurred')
//         setIsRecording(false)
//         isRecordingRef.current = false
//       }

//       mediaRecorderRef.current = recorder
//       console.log('✅ Media recorder initialized')
//     } catch (e) {
//       console.error("Failed to initialize media recorder:", e)
//       setError("Failed to access microphone")
//     }
//   }, [session?.id])

//   const startInterview = useCallback(async (
//     techStack = "JavaScript, React, Node.js",
//     position = "Software Developer"
//   ) => {
//     setError(null)
//     setInterviewState("connecting")
//     try {
//       console.log("🔌 Connecting to server...")
//       const socket = await connectSocket()
//       console.log("📤 Sending startInterview message...")
//       socket.emit("startInterview", { techStack, position })

//       // Initialize media components after connection
//       await initializeMediaRecorder()
//     } catch (err) {
//       console.error("❌ Failed to start interview:", err)
//       setError("Failed to connect to server. Please try again.")
//       setInterviewState("idle")
//     }
//   }, [connectSocket, initializeMediaRecorder])

//   const startRecording = useCallback(() => {
//     if (isRecordingRef.current) {
//       console.log('⚠️ Recording already in progress')
//       return
//     }

//     if (!mediaRecorderRef.current) {
//       console.log('⚠️ Media recorder not initialized')
//       setError('Recording not available. Please try reloading the page.')
//       return
//     }

//     if (interviewState !== "active" && interviewState !== "waiting_for_next") {
//       console.log('⚠️ Cannot record in current state:', interviewState)
//       return
//     }

//     console.log('🎤 Starting recording...')
//     setIsRecording(true)
//     setInterimTranscript("")
//     setError(null)
//     isRecordingRef.current = true

//     try {
//       // Check media recorder state
//       if (mediaRecorderRef.current.state === 'recording') {
//         console.log('⚠️ Media recorder already recording')
//         return
//       }

//       if (mediaRecorderRef.current.state === 'paused') {
//         mediaRecorderRef.current.resume()
//       } else {
//         // Start recording in smaller chunks for better real-time processing
//         mediaRecorderRef.current.start(250) // Record in 250ms chunks
//         console.log('🎤 [Frontend] startRecording() called — beginning user utterance');
//       }

//       // Set a maximum recording time of 30 seconds as fallback
//       recordingTimeoutRef.current = setTimeout(() => {
//         console.log('⏰ Recording timeout reached, stopping automatically')
//         stopRecording()
//       }, 30000)

//     } catch (e) {
//       console.error("Failed to start recording:", e)
//       setError("Failed to start recording")
//       setIsRecording(false)
//       isRecordingRef.current = false
//     }
//   }, [interviewState])

//   const stopRecording = useCallback(() => {
//     if (!isRecordingRef.current) {
//       console.log('⚠️ Not currently recording')
//       return
//     }

//     console.log('🛑 Stopping recording...')

//     // Clear timeout
//     if (recordingTimeoutRef.current) {
//       clearTimeout(recordingTimeoutRef.current)
//       recordingTimeoutRef.current = null
//     }

//     // Stop media recorder
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
//       try {
//         console.log('🛑 [Frontend] stopRecording() — user finished speaking');
// mediaRecorderRef.current.stop();
// console.log('🛑 [Frontend] emitted finalizeAudio');
//         socketRef.current?.emit("finalizeAudio", { sessionId: session!.id });

//       } catch (e) {
//         console.error("Error stopping media recorder:", e)
//       }
//     }

//     setIsRecording(false)
//     setInterviewState("processing")
//     isRecordingRef.current = false
//   }, [])

//   const playAudio = useCallback((url?: string) => {
//     const audioSrc = url || audioUrl
//     if (audioSrc) {
//       console.log('🔊 Playing audio:', audioSrc)
//       if (audioRef.current) {
//         audioRef.current.pause()
//       }

//       audioRef.current = new Audio(audioSrc)
//       audioRef.current.play().then(() => {
//         setIsPlaying(true)
//       }).catch((e) => {
//         console.error('Failed to play audio:', e)
//         setError('Failed to play audio')
//       })

//       audioRef.current.onended = () => {
//         setIsPlaying(false)
//         console.log('🔊 Audio playback completed')
//       }

//       audioRef.current.onerror = (e) => {
//         console.error('Audio playback error:', e)
//         setError('Audio playback error')
//         setIsPlaying(false)
//       }
//     }
//   }, [audioUrl])

//   const pauseAudio = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause()
//       setIsPlaying(false)
//     }
//   }, [])

//   const nextQuestion = useCallback(() => {
//     setInterviewState("waiting_for_next")
//     setProgress((p) => Math.min(p + 20, 100))
//   }, [])

//   const endInterview = useCallback(() => {
//     if (session?.id && socketRef.current?.connected) {
//       socketRef.current.emit("endInterview", { sessionId: session.id })
//     }

//     setInterviewState("completed")
//     setProgress(100)
//     cleanup()
//   }, [session?.id, cleanup])

//   // Cleanup on unmount
//   useEffect(() => {
//     return cleanup
//   }, [cleanup])

//   return {
//     session,
//     currentQuestion: currentQuestion?.questionText || "",
//     transcript,
//     interimTranscript,
//     isRecording,
//     isPlaying,
//     audioUrl,
//     interviewState,
//     progress,
//     responses,
//     error,
//     isConnected,
//     startInterview,
//     stopRecording,
//     startRecording,
//     playAudio,
//     pauseAudio,
//     nextQuestion,
//     endInterview,
//     clearError: () => setError(null),
//   }
// }