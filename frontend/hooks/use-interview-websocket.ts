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
    if (isConnectedRef.current) {
      console.log('Already connected')
      return Promise.resolve()
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
    console.log('🌐 Attempting to connect to:', wsUrl)

    if (wsRef.current) {
      await wsRef.current.disconnect();
      wsRef.current = null;
    }

    wsRef.current = new WebSocketManager(wsUrl)

    try {
      // Set up event handlers before attempting connection
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

      // Add reconnection handler
      wsRef.current.on("reconnect_attempt", (attemptNumber: number) => {
        console.log(`Attempting to reconnect (${attemptNumber})...`)
      })

      wsRef.current.on("reconnect_failed", () => {
        console.error("Failed to reconnect after all attempts")
        if (onError) {
          onError("Connection lost and failed to reconnect")
        }
      })

      // Attempt connection with retry logic
      await wsRef.current.connect()
      isConnectedRef.current = true
      console.log('✅ WebSocket connection established')
      
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      isConnectedRef.current = false
      if (onError) {
        onError(error instanceof Error ? error.message : "Connection failed")
      }
      throw error; // Propagate the error to be handled by the caller
    }
  }, [
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
      try {
        wsRef.current.disconnect();
      } catch (error) {
        console.error('Error during disconnect:', error);
      } finally {
        wsRef.current = null;
        isConnectedRef.current = false;
      }
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
      connect()
    

    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected: isConnectedRef.current,
    sendMessage,
    connect,
    disconnect,
  }
}
