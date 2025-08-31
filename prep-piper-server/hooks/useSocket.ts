"use client"

import { useState, useEffect, useCallback } from "react"
import { type Socket } from "socket.io-client"
import { SocketManager } from "@/components/connection/socket-manager"

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting")
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    try {
      setConnectionState("connecting")
      setError(null)
      
      const socketInstance = await SocketManager.getInstance()
      setSocket(socketInstance)
      setConnectionState("connected")
      
      // Set up connection monitoring
      socketInstance.on("connect", () => {
        setConnectionState("connected")
        setError(null)
      })
      
      socketInstance.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason)
        setConnectionState("disconnected")
      })
      
      socketInstance.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err)
        setConnectionState("error")
        setError(err.message || "Connection failed")
      })
      
      socketInstance.io.on("reconnect_attempt", () => {
        setConnectionState("connecting")
      })
      
    } catch (err) {
      setConnectionState("error")
      setError(err instanceof Error ? err.message : "Failed to connect")
    }
  }, [])

  const disconnect = useCallback(() => {
    SocketManager.disconnect()
    setSocket(null)
    setConnectionState("disconnected")
    setError(null)
  }, [])

  useEffect(() => {
    connect()
    return () => {
      // Don't disconnect on unmount to maintain singleton
    }
  }, [connect])

  return {
    socket,
    connectionState,
    error,
    connect,
    disconnect,
    isConnected: connectionState === "connected"
  }
}
