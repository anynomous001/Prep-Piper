"use client"

import { useEffect, useRef, useCallback } from "react"
import { WebSocketManager } from "@/lib/websocket"
import type {
  StartInterviewData,
  InterimTranscriptData,
  TranscriptData,
  AudioGeneratedData,
  InterviewCompleteData,
  AudioChunkData,
} from "@/lib/types"

interface UseInterviewWebSocketProps {
  sessionId: string | null
  onStartInterview?: (data: StartInterviewData) => void
  onInterimTranscript?: (data: InterimTranscriptData) => void
  onTranscript?: (data: TranscriptData) => void
  onAudioGenerated?: (data: AudioGeneratedData) => void
  onInterviewComplete?: (data: InterviewCompleteData) => void
  onAudioChunk?: (data: AudioChunkData) => void
  onError?: (error: string) => void
}

export function useInterviewWebSocket({
  sessionId,
  onStartInterview,
  onInterimTranscript,
  onTranscript,
  onAudioGenerated,
  onInterviewComplete,
  onAudioChunk,
  onError,
}: UseInterviewWebSocketProps) {
  const wsRef = useRef<WebSocketManager | null>(null)
  const isConnectedRef = useRef(false)

  const connect = useCallback(async () => {
    if (!sessionId || isConnectedRef.current) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
    wsRef.current = new WebSocketManager(`${wsUrl}?sessionId=${sessionId}`)

    try {
      await wsRef.current.connect()
      isConnectedRef.current = true

      // Set up event handlers
      if (onStartInterview) {
        wsRef.current.on("startInterview", onStartInterview)
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
    onStartInterview,
    onInterimTranscript,
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
      if (wsRef.current?.isConnected) {
        wsRef.current.send({ type, sessionId: sessionId!, data })
      }
    },
    [sessionId],
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
