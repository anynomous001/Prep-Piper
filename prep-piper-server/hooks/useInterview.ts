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

  // Audio recording refs
  const [isRecording, setIsRecording] = useState(false)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const deepgramConnectionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

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


// Add the first question to transcript
  setTranscript((t) => ({
    messages: [
      ...t.messages,
      { role: "interviewer", text: payload.question.questionText, timestamp: new Date() }
    ],
    interim: ""
  }))


    }

    const onNextQuestion = (payload: { question: string }) => {
      console.log("❓ Next question received:", payload.question)
      setQuestion(payload.question)
      setQuestionIdx((i) => Math.min(i + 1, totalQuestions))
    // Add question to conversation history
  setTranscript((t) => ({
    messages: [
      ...t.messages,
      { role: "interviewer", text: payload.question, timestamp: new Date() }
    ],
    interim: ""
  }))
  
      setInterviewState("active")
    }

    const onInterviewComplete = (payload: { message?: string }) => {
      console.log("🏁 Interview completed:", payload)
      setInterviewState("completed")
      cleanup()
      
      if (payload?.message) {
    setTranscript((t) => ({
      messages: [
        ...t.messages,
        { role: "interviewer", text: `Interview Complete: ${payload.message}`, timestamp: new Date() }
      ],
      interim: ""
    }))
  }
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
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up media resources...')
    
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
           console.log('📝 Final transcript:', text)
          // Buffer final STT locally—do NOT send to agent yet
  // Add candidate response to conversation
      setTranscript((t) => ({
        messages: [
          ...t.messages,
          { role: "candidate", text: text.trim(), timestamp: new Date() }
        ],
        interim: ""
      }))
          setInterviewState("waiting_for_next")
         } else {
          setTranscript((t) => ({ ...t, interim: text }))
          setInterviewState("processing")
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
  }, [interviewState, sessionId, socket])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording) {
      console.log('⚠️ Not currently recording')
      return
    }

    console.log('🛑 Stopping recording...')
    
    // Stop Deepgram connection
    if (deepgramConnectionRef.current) {
      try {
        deepgramConnectionRef.current.finish()
        deepgramConnectionRef.current = null
      } catch (e) {
        console.log('Deepgram connection already closed')
      }
    }
    
    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    setIsRecording(false)
    console.log('✅ Recording stopped')
  }, [isRecording])

  // Submit voice response (finalize current recording)
const submitVoiceResponse = useCallback(() => {
  if (!sessionId || !socket || !isConnected) {
    console.warn("Cannot submit voice response—missing session or socket")
    return
  }
  // Gather the last final transcript item (or interim if needed)
//   const last = transcript.final[transcript.final.length - 1] || transcript.interim
//   if (!last) {
//     console.warn("No transcript available to submit")
//     return
//   }

//   console.log("🔊 Submitting voice response to agent:", last)
//   socket.emit("processTranscript", {
//     sessionId,
//     text: last.replace(/^You:\s*/, "")  // strip the prefix
//   })

 const candidateMessages = transcript.messages.filter(m => m.role === "candidate")
  const lastMessage = candidateMessages[candidateMessages.length - 1]
  
  if (!lastMessage) {
    console.warn("No candidate response available to submit")
    return
  }

  console.log("🔊 Submitting voice response to agent:", lastMessage.text)
  socket.emit("processTranscript", {
    sessionId,
    text: lastMessage.text
  })

  setInterviewState("processing")
  // Optionally clear interim and final buffer if desired
//   setTranscript({ interim: "", final: [] })
}, [sessionId, socket, isConnected,transcript.messages])


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
