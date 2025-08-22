"use client"

import { useEffect, useRef, useCallback } from "react"
import { WebSocketManager } from "@/lib/websocket"
import type {
  InterimTranscriptData,
  TranscriptData,
  AudioGeneratedData,
  InterviewCompleteData,
  AudioChunkData,
} from "@/lib/types"

interface UseInterviewWebSocketProps {
  sessionId: string | null
  onInterviewStarted?: (data: any) => void
  onSttConnected?: (data: { sessionId: string }) => void
  onInterimTranscript?: (data: InterimTranscriptData) => void
  onTranscript?: (data: TranscriptData) => void
  onAudioGenerated?: (data: AudioGeneratedData) => void
  onInterviewComplete?: (data: InterviewCompleteData) => void
  onAudioChunk?: (data: AudioChunkData) => void
  onError?: (error: string) => void
}

export function useInterviewWebSocket({
  sessionId,
  onInterviewStarted,
  onInterimTranscript,
  onSttConnected,
  onTranscript,
  onAudioGenerated,
  onInterviewComplete,
  onAudioChunk,
  onError,
}: UseInterviewWebSocketProps) {
  const wsRef = useRef<WebSocketManager | null>(null)
  const isConnectedRef = useRef(false)

  const connect = useCallback(async () => {
    console.log('🔌 connect() called with sessionId:', sessionId)
    
    if (isConnectedRef.current) {
      console.log('Already connected')
      return Promise.resolve()
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
      console.log('🌐 Connecting to:', wsUrl)

    wsRef.current = new WebSocketManager(wsUrl)

    try {
      await wsRef.current.connect()
      isConnectedRef.current = true
    console.log('✅ WebSocket connection established')

      if (onInterviewStarted) {
        wsRef.current.on("interviewStarted", onInterviewStarted)
      }
      if (onSttConnected) {
        wsRef.current.on("sttConnected", onSttConnected)
      }
      if (onInterimTranscript) {
        wsRef.current.on("interimTranscript", onInterimTranscript)
      }
      if (onTranscript) {
        wsRef.current.on("transcript", onTranscript)
      }
      if (onAudioGenerated) {
        wsRef.current.on("audioGenerated", onAudioGenerated)
      }
      if (onInterviewComplete) {
        wsRef.current.on("interviewComplete", onInterviewComplete)
      }
      if (onAudioChunk) {
        wsRef.current.on("audioChunk", onAudioChunk)
      }
      if (onError) {
        wsRef.current.on("error", onError)
      }
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      isConnectedRef.current = false
      if (onError) {
        onError(error instanceof Error ? error.message : "Connection failed")
      }
    }
  }, [
    sessionId,
    onInterviewStarted,
    onInterimTranscript,
    onSttConnected,
    onTranscript,
    onAudioGenerated,
    onInterviewComplete,
    onAudioChunk,
    onError,
  ])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
      isConnectedRef.current = false
    }
  }, [])

  const sendMessage = useCallback(
    (type: string, data: any) => {
          console.log(`📤 Attempting to send message: ${type}`, data)
       
    if (!wsRef.current) {
      console.error("❌ WebSocket manager not initialized")
      return
    }

     if (!wsRef.current.isConnected) {
      console.error("❌ WebSocket is not connected")
      return
    }
    
     try {
      wsRef.current.send({ type, data })
      console.log(`✅ Message sent successfully: ${type}`)
    } catch (error) {
      console.error(`❌ Error sending message ${type}:`, error)
    }
    },
    []
  )

  useEffect(() => {
    if (sessionId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [sessionId, connect, disconnect])

  return {
    isConnected: isConnectedRef.current,
    sendMessage,
    connect,
    disconnect,
  }
}
