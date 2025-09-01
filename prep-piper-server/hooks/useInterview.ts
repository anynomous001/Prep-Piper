"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { InterviewState, TranscriptState, TechSelection } from "@/lib/types"
import { useSocket } from "./useSocket"

export default  function useInterview() {
  const { socket, connectionState, isConnected } = useSocket()
  
  // Interview state
  const [interviewState, setInterviewState] = useState<InterviewState>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<string>("")
  const [questionIdx, setQuestionIdx] = useState(0)
  const totalQuestions = 5
  const [transcript, setTranscript] = useState<TranscriptState>({ interim: "", final: [] })
  const [error, setError] = useState<string | null>(null)

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const isRecordingRef = useRef(false)

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return

    const onInterviewStarted = (payload: { sessionId: string; question: { questionText: string } }) => {
      console.log("🎯 Interview started:", payload)
      setSessionId(payload.sessionId)
      setQuestion(payload.question.questionText)
      setQuestionIdx(1)
      setInterviewState("active")
      setError(null)
    }

    const onNextQuestion = (payload: { question: string }) => {
      console.log("❓ Next question received:", payload.question)
      setQuestion(payload.question)
      setQuestionIdx((i) => Math.min(i + 1, totalQuestions))
      setInterviewState("active")
    }

    const onInterviewComplete = (payload: { message?: string }) => {
      console.log("🏁 Interview completed:", payload)
      setInterviewState("completed")
      cleanup()
      
      if (payload?.message) {
        setTranscript((t) => ({ 
          interim: "", 
          final: [...t.final, `Interview Complete: ${payload.message}`] 
        }))
      }
    }

    const onInterimTranscript = (payload: { text: string; confidence?: number }) => {
      setTranscript((t) => ({ ...t, interim: payload.text }))
      setInterviewState("processing")
    }

    const onFinalTranscript = (payload: { text: string; confidence?: number; isFinal: boolean; source?: string }) => {
  console.log("📝 Final transcript:", payload.text, "Source:", payload.source || "voice")
  
  // Only add to transcript if it's from voice (STT), text responses are already added locally
  if (!payload.source || payload.source === "voice") {
    setTranscript((t) => ({ 
      interim: "", 
      final: [...t.final, `You: ${payload.text}`] 
    }))
  }
  setInterviewState("waiting_for_next")
}


    const onSttConnected = (payload: { sessionId: string }) => {
      console.log("🎤 STT connected for session:", payload.sessionId)
      setTranscript((t) => ({ 
        ...t, 
        final: [...t.final, "[STT Service Connected]"] 
      }))
    }

    const onError = (payload: { message?: string; error?: string }) => {
      const errorMsg = payload.message || payload.error || "Unknown error"
      console.error("❌ Interview error:", errorMsg)
      setError(errorMsg)
      setInterviewState("idle")
      cleanup()
    }

    // Register event listeners
    socket.on("interviewStarted", onInterviewStarted)
    socket.on("nextQuestion", onNextQuestion)
    socket.on("interviewComplete", onInterviewComplete)
    socket.on("interimTranscript", onInterimTranscript)
    socket.on("transcript", onFinalTranscript)
    socket.on("sttConnected", onSttConnected)
    socket.on("error", onError)

    return () => {
      // Cleanup event listeners
      socket.off("interviewStarted", onInterviewStarted)
      socket.off("nextQuestion", onNextQuestion)
      socket.off("interviewComplete", onInterviewComplete)
      socket.off("interimTranscript", onInterimTranscript)
      socket.off("transcript", onFinalTranscript)
      socket.off("sttConnected", onSttConnected)
      socket.off("error", onError)
    }
  }, [socket, isConnected])

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up media resources...')
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        console.log('Media recorder already stopped')
      }
    }
    
    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('🎤 Media track stopped:', track.kind)
      })
      mediaStreamRef.current = null
    }
    
    setIsRecording(false)
    isRecordingRef.current = false
  }, [])

  // Start interview
  const startInterview = useCallback((selection: TechSelection) => {
    if (!isConnected || !socket) {
      setError("Not connected to server")
      return
    }

    console.log("🚀 Starting interview with selection:", selection)
    setInterviewState("connecting")
    setError(null)
    
    // Emit startInterview event matching backend3 expectations
    socket.emit("startInterview", {
      position: selection.position,
      techStack: selection.techs.join(", "),
      experience: selection.experience
    })
  }, [socket, isConnected])

  // Initialize audio recording
//   const initializeAudioRecording = useCallback(async () => {
//     try {
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

//     //   recorder.ondataavailable = async (e) => {
//     //     if (e.data.size > 0 && sessionId && socket && isConnected) {
//     //       const arrayBuffer = await e.data.arrayBuffer()
//     //       const audioData = Array.from(new Uint8Array(arrayBuffer))
          
//     //       // Send audio chunk to backend3 matching expected format
//     //       socket.emit("audioChunk", {
//     //         sessionId,
//     //         audioData
//     //       })
//     //     }
//     //   }

// recorder.ondataavailable = async (e) => {
//   console.log(`📊 Audio data available: ${e.data.size} bytes, type: ${e.data.type}`)
  
//   if (e.data.size > 0 && sessionId && socket && isConnected) {
//     try {
//       const arrayBuffer = await e.data.arrayBuffer()
//       const audioData = Array.from(new Uint8Array(arrayBuffer))
      
//       console.log(`📤 Sending audio chunk: ${audioData.length} bytes to session ${sessionId}`)
      
//       // Send audio chunk to backend3 matching expected format
//       socket.emit("audioChunk", {
//         sessionId,
//         audioData
//       })
      
//       console.log(`✅ Audio chunk sent successfully`)
//     } catch (error) {
//       console.error(`❌ Error processing audio data:`, error)
//     }
//   } else {
//     console.warn(`⚠️ Audio chunk not sent:`, {
//       dataSize: e.data.size,
//       hasSessionId: !!sessionId,
//       hasSocket: !!socket,
//       isConnected
//     })
//   }
// }



//       recorder.onstart = () => {
//         console.log('🎤 Media recorder started')
//         setIsRecording(true)
//         isRecordingRef.current = true
//       }

//       recorder.onstop = () => {
//         console.log('🎤 Media recorder stopped')
//         setIsRecording(false)
//         isRecordingRef.current = false
        
//         // Finalize audio session
//         // if (sessionId && socket && isConnected) {
//         //   socket.emit("finalizeAudio", { sessionId })
//         // }
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
//   }, [sessionId, socket, isConnected])


let audioProcessor: ScriptProcessorNode

async function initializeAudioRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioCtx = new AudioContext({ sampleRate: 16000 })
  mediaStreamRef.current = stream
  const source = audioCtx.createMediaStreamSource(stream)

  audioProcessor = audioCtx.createScriptProcessor(4096, 1, 1)
  source.connect(audioProcessor)
  audioProcessor.connect(audioCtx.destination)

  audioProcessor.onaudioprocess = (evt) => {
    const inputBuffer = evt.inputBuffer.getChannelData(0)
    // Convert Float32Array [-1,1] to 16-bit PCM
    const pcm = new Int16Array(inputBuffer.length)
    for (let i = 0; i < inputBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, inputBuffer[i]))
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    // Send PCM buffer
    socket?.emit("audioChunk", { sessionId, audioData: Array.from(new Uint8Array(pcm.buffer)) })
  }

  setIsRecording(true)
}

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) {
      console.log('⚠️ Recording already in progress')
      return
    }

    if (interviewState !== "active") {
      console.log('⚠️ Cannot record in current state:', interviewState)
      return
    }

    if (!mediaRecorderRef.current) {
      await initializeAudioRecording()
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      try {
        mediaRecorderRef.current.start(250) // Send chunks every 250ms
        console.log('🎤 Recording started')
      } catch (e) {
        console.error("Failed to start recording:", e)
        setError("Failed to start recording")
      }
    }
  }, [interviewState, initializeAudioRecording])

  // Stop recording
//   const stopRecording = useCallback(() => {
//     if (!isRecordingRef.current) {
//       console.log('⚠️ Not currently recording')
//       return
//     }

//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
//       try {
//         mediaRecorderRef.current.stop()
//         console.log('🛑 Recording stopped')
//       } catch (e) {
//         console.error("Error stopping recording:", e)
//       }
//     }
    
//     setInterviewState("processing")
//   }, [])



  function stopRecording() {
  audioProcessor.disconnect()
  mediaStreamRef.current?.getTracks().forEach(t => t.stop())
  setIsRecording(false)
}
  // Submit text response
//   const submitTextResponse = useCallback((text: string) => {
//     if (!socket || !isConnected || !sessionId) {
//       setError("Not connected to server")
//       return
//     }

//     console.log("📝 Submitting text response:", text)
    
//     // Send text as transcript matching backend3 format
//     socket.emit("transcript", {
//       sessionId,
//       text,
//       confidence: 1.0,
//       isFinal: true,
//       timestamp: new Date()
//     })
    
//     setTranscript((t) => ({ 
//       interim: "", 
//       final: [...t.final, text] 
//     }))
//     setInterviewState("processing")
//   }, [socket, isConnected, sessionId])

const submitVoiceResponse = useCallback(() => {
  if (!socket || !isConnected || !sessionId) {
    setError("Not connected to server")
    return
  }
  console.log("🔊 Finalizing voice response for session:", sessionId)
  socket.emit("finalizeAudio", { sessionId })
  setInterviewState("processing")
}, [socket, isConnected, sessionId])

// Submit text response
const submitTextResponse = useCallback((text: string) => {
  if (!socket || !isConnected || !sessionId) {
    setError("Not connected to server")
    return
  }

  console.log("📝 Submitting text response:", text)
  
  // Use dedicated textResponse event for text input
  socket.emit("textResponse", {
    sessionId,
    text: text.trim()
  })
  
  // Update local transcript immediately for better UX
  setTranscript((t) => ({ 
    interim: "", 
    final: [...t.final, `You: ${text.trim()}`] 
  }))
  setInterviewState("processing")
}, [socket, isConnected, sessionId])




  // End interview
  const endInterview = useCallback(() => {
    if (sessionId && socket && isConnected) {
      socket.emit("endInterview", { sessionId })
    }
    setInterviewState("completed")
    cleanup()
  }, [sessionId, socket, isConnected, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    // State
    connectionState,
    interviewState,
    sessionId,
    question,
    questionIdx,
    totalQuestions,
    transcript,
    isRecording,
    error,
    isConnected,

    // Actions
    startInterview,
    startRecording,
    stopRecording,
    submitTextResponse,
    submitVoiceResponse,
    endInterview,
    clearError: () => setError(null),
  }
}
