"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { InterviewState, TranscriptState, TechSelection } from "@/lib/types"
import { useSocket } from "./useSocket"
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk"

export default function useInterview() {
  const { socket, connectionState, isConnected } = useSocket()
  
  // Interview state
  const [interviewState, setInterviewState] = useState<InterviewState>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<string>("")
  const [questionIdx, setQuestionIdx] = useState(0)
  const totalQuestions = 5
const [transcript, setTranscript] = useState<TranscriptState>({ 
  messages: [], 
  interim: "" 
})
 const [error, setError] = useState<string | null>(null)

 // Live transcription buffer - separate from conversation history
  const [liveTranscription, setLiveTranscription] = useState("")
  const [candidateResponseBuffer, setCandidateResponseBuffer] = useState("")


  // Audio recording refs
  const [isRecording, setIsRecording] = useState(false)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const deepgramConnectionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)


const [elapsedSeconds, setElapsedSeconds] = useState(0)
const timerRef = useRef<NodeJS.Timeout | null>(null)

// Helper to add message if it’s not already last
const addInterviewerMessage = useCallback((text: string) => {
  setTranscript((t) => {
    const last = t.messages[t.messages.length - 1]
    if (last?.role === "interviewer" && last.text === text) {
      return t  // skip duplicate
    }
    return {
      messages: [
        ...t.messages,
        { role: "interviewer", text, timestamp: new Date() }
      ],
      interim: ""
    }
  })
}, [])



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
      
      addInterviewerMessage(payload.question.questionText)

// Add the first question to transcript
  // setTranscript((t) => ({
  //   messages: [
  //     ...t.messages,
  //     { role: "interviewer", text: payload.question.questionText, timestamp: new Date() }
  //   ],
  //   interim: ""
  // }))


    }

    const onNextQuestion = (payload: { question: string }) => {
      console.log("❓ Next question received:", payload.question)
  addInterviewerMessage(payload.question) // ← This was using 'question' (old value)

      setQuestion(payload.question)
      setQuestionIdx((i) => Math.min(i + 1, totalQuestions))
    // Add question to conversation history
  // setTranscript((t) => ({
  //   messages: [
  //     ...t.messages,
  //     { role: "interviewer", text: payload.question, timestamp: new Date() }
  //   ],
  //   interim: ""
  // }))
  
      setInterviewState("active")
    }

    const onInterviewComplete = (payload: { message?: string }) => {
      console.log("🏁 Interview completed:", payload)
       if (payload?.message) {
    addInterviewerMessage(payload.message)
  }
      setInterviewState("completed")
      cleanup()
      
  //     if (payload?.message) {
  //   setTranscript((t) => ({
  //     messages: [
  //       ...t.messages,
  //       { role: "interviewer", text: `Interview Complete: ${payload.message}`, timestamp: new Date() }
  //     ],
  //     interim: ""
  //   }))
  // }
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
    socket.on("error", onError)

    return () => {
      socket.off("interviewStarted", onInterviewStarted)
      socket.off("nextQuestion", onNextQuestion)
      socket.off("interviewComplete", onInterviewComplete)
      socket.off("error", onError)
    }
  }, [socket, isConnected])

  // Cleanup function
 // UPDATE: New media-only cleanup function - doesn't clear response buffer
  const cleanupMediaOnly = useCallback(() => {
    console.log('🧹 Cleaning up media resources only...')
    
    // Stop Deepgram connection
    if (deepgramConnectionRef.current) {
      try {
        deepgramConnectionRef.current.finish()
        deepgramConnectionRef.current = null
      } catch (e) {
        console.log('Deepgram connection already closed')
      }
    }

    // Stop audio processor
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    // Stop audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
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
    // UPDATE: Don't clear response buffer or live transcription here
    // User might still want to submit the buffered response
  }, [])

  // UPDATE: Full cleanup function - clears everything including response buffer
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up all resources...')
    
    cleanupMediaOnly()
     if (timerRef.current) {
    clearInterval(timerRef.current)
    timerRef.current = null
  }
    // UPDATE: Clear response buffer and live transcription
    setCandidateResponseBuffer("")
    setLiveTranscription("")
  }, [cleanupMediaOnly])

  // Start interview
  const startInterview = useCallback((selection: TechSelection) => {
    if (!isConnected || !socket) {
      setError("Not connected to server")
      return
    }

    console.log("🚀 Starting interview with selection:", selection)
    setInterviewState("connecting")
    setError(null)

     setElapsedSeconds(0)
  if (timerRef.current) clearInterval(timerRef.current)
  timerRef.current = setInterval(() => {
    setElapsedSeconds((s) => s + 1)
  }, 1000)
    
    // Emit startInterview event
    socket.emit("startInterview", {
      position: selection.position,
      techStack: selection.techs.join(", "),
      experience: selection.experience
    })
  }, [socket, isConnected])

  // Start recording with Deepgram direct connection
  const startRecording = useCallback(async () => {
    if (isRecording) {
      console.log('⚠️ Recording already in progress')
      return
    }

    if (interviewState !== "active" || !sessionId) {
      console.log('⚠️ Cannot record in current state:', interviewState)
      return
    }

    try {
      console.log('🎤 Requesting microphone access...')
      
      // Check if API key exists
      if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
        throw new Error("Deepgram API key not found. Please add NEXT_PUBLIC_DEEPGRAM_API_KEY to your environment variables.")
      }
      
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      mediaStreamRef.current = stream
      console.log('✅ Microphone access granted')

      // Create Deepgram connection
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!)
      
      console.log('🔗 Creating Deepgram connection...')
      
      const dgConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        interim_results: true,
        punctuate: true,
        encoding: "linear16",
        sample_rate: 16000,
        channels: 1,
        utterance_end_ms: 1500, // 1.5 seconds of silence to finalize
        endpointing: 300, // 300ms to detect end of speech
      })

      deepgramConnectionRef.current = dgConnection

      // Set up Deepgram event listeners using correct API
      dgConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log('🔗 Deepgram connection opened')
        // setTranscript((t) => ({ 
        //   ...t, 
        //   final: [...t.final, "[STT Service Connected]"] 
        // }))
      })

         dgConnection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
       if (data.channel?.alternatives?.[0]?.transcript) {
          const text = data.channel.alternatives[0].transcript.trim()
         if (data.is_final) {
           console.log('📝 Final transcript chunk:', text)
          // Add to buffer
              setCandidateResponseBuffer(prev => {
                const newBuffer = prev ? `${prev} ${text}` : text
                console.log('📦 Updated buffer:', newBuffer)
                return newBuffer
              })

              // Clear live transcription since this is final
              setLiveTranscription("")
         } else {
                        setLiveTranscription(text)
            console.log('💬 Interim transcript chunk:', text)
        }
    }
      })

      dgConnection.on(LiveTranscriptionEvents.Close, (event: any) => {
        console.log('🔗 Deepgram connection closed:', event)
      })

      dgConnection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('❌ Deepgram error:', error)
        setError('Speech recognition error: ' + error.message)
      })

      // Create audio context and processor (suppress deprecation warning is expected)
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      // Connect audio pipeline
      source.connect(processor)
      processor.connect(audioContext.destination)

      // Process audio and send to Deepgram
      processor.onaudioprocess = (event) => {
        if (deepgramConnectionRef.current && deepgramConnectionRef.current.getReadyState() === 1) {
          const inputBuffer = event.inputBuffer.getChannelData(0)
          
          // Convert Float32Array to 16-bit PCM
          const pcmBuffer = new Int16Array(inputBuffer.length)
          for (let i = 0; i < inputBuffer.length; i++) {
            const s = Math.max(-1, Math.min(1, inputBuffer[i]))
            pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
          }
          
          try {
            deepgramConnectionRef.current.send(pcmBuffer.buffer)
          } catch (e) {
            console.error('Error sending audio to Deepgram:', e)
          }
        }
      }

      setIsRecording(true)
      console.log('🎤 Recording started with Deepgram')

    } catch (e) {
      console.error("Failed to start recording:", e)
      setError(`Failed to start recording: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }, [interviewState, sessionId])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording) {
      console.log('⚠️ Not currently recording')
      return
    }

    console.log('🛑 Stopping recording...')
    cleanupMediaOnly()
    
 console.log('✅ Recording stopped - response ready for manual submission')
    console.log('📦 Buffered response:', candidateResponseBuffer)
  }, [isRecording, candidateResponseBuffer, cleanupMediaOnly])

  // UPDATE: Completely rewritten manual voice response submission
  const submitVoiceResponse = useCallback(() => {
    if (!candidateResponseBuffer.trim()) {
      console.warn("No response to submit")
      setError("No response recorded. Please record your answer first.")
      return
    }

    if (!socket || !isConnected || !sessionId) {
      setError("Not connected to server")
      return
    }

    console.log("📝 Manually submitting voice response:", candidateResponseBuffer)
    
    // Add complete response to conversation history
    setTranscript((t) => ({
      messages: [
        ...t.messages,
        { role: "candidate", text: candidateResponseBuffer.trim(), timestamp: new Date() }
      ],
      interim: ""
    }))

    // Submit to agent
    socket.emit("processTranscript", {
      sessionId,
      text: candidateResponseBuffer.trim()
    })

    setInterviewState("processing")

    // Clear buffer after successful submission
    setCandidateResponseBuffer("")
    setLiveTranscription("")

    console.log("✅ Voice response submitted successfully")
  }, [candidateResponseBuffer, sessionId, socket, isConnected])


  // Submit text response
  const submitTextResponse = useCallback((text: string) => {
    if (!socket || !isConnected || !sessionId) {
      setError("Not connected to server")
      return
    }

    console.log("📝 Submitting text response:", text)
    
     setTranscript((t) => ({
    messages: [
      ...t.messages,
      { role: "candidate", text: text.trim(), timestamp: new Date() }
    ],
    interim: ""
  }))
  
  socket.emit("processTranscript", {
    sessionId,
    text: text.trim()
  })
    
    // setTranscript((t) => ({ 
    //   interim: "", 
    //   final: [...t.final, `You: ${text.trim()}`] 
    // }))
    setInterviewState("processing")
  }, [socket, isConnected, sessionId])

  // End interview
    const endInterview = useCallback(() => {
    if (sessionId && socket && isConnected) {
      console.log("🛑 Ending interview early")
      socket.emit("endInterview", { sessionId, early: true })
    }

    setInterviewState("completed")
    cleanup()

    // UPDATE: Remove frontend completion message
    // Agent will send contextual completion message through onInterviewComplete event
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
    liveTranscription, // Separate live transcription display
    candidateResponseBuffer, // UPDATE: Expose buffer to UI for display
    isRecording,
    error,
    isConnected,
    elapsedSeconds,

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
