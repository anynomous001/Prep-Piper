"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { io, Socket } from "socket.io-client"

interface UseInterviewWebSocketProps {
  onInterviewStarted?: (data: any) => void
  onSttConnected?: (data: { sessionId: string }) => void
  onInterimTranscript?: (data: any) => void
  onTranscript?: (data: any) => void
  onAudioGenerated?: (data: any) => void
  onInterviewComplete?: (data: any) => void
  onAudioChunk?: (data: any) => void
  onError?: (error: string) => void
  onNextQuestion?: (data: any) => void
}

// Global socket manager to prevent multiple instances
class GlobalSocketManager {
  private static instance: GlobalSocketManager | null = null
  private socket: Socket | null = null
  private connectionPromise: Promise<Socket> | null = null
  private isConnecting = false

  static getInstance(): GlobalSocketManager {
    if (!GlobalSocketManager.instance) {
      GlobalSocketManager.instance = new GlobalSocketManager()
    }
    return GlobalSocketManager.instance
  }

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket
    }

    // If already connecting, return the existing promise
    if (this.connectionPromise && this.isConnecting) {
      return this.connectionPromise
    }

    // Create new connection promise
    this.connectionPromise = this.createConnection()
    return this.connectionPromise
  }

  private async createConnection(): Promise<Socket> {
    if (this.isConnecting) {
      throw new Error("Already connecting")
    }

    this.isConnecting = true
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
    
    console.log('🌐 Creating new socket connection to:', wsUrl)

    // Clean up existing connection
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    return new Promise((resolve, reject) => {
      const socket = io(wsUrl, {
        transports: ['websocket'],
        timeout: 10000,
        autoConnect: false,
        forceNew: true,
      })

      const connectTimeout = setTimeout(() => {
        socket.disconnect()
        this.isConnecting = false
        reject(new Error('Connection timeout'))
      }, 10000)

      socket.on('connect', () => {
        clearTimeout(connectTimeout)
        this.isConnecting = false
        this.socket = socket
        console.log('✅ Global socket connected successfully')
        resolve(socket)
      })

      socket.on('connect_error', (error) => {
        clearTimeout(connectTimeout)
        this.isConnecting = false
        console.error('❌ Global socket connection error:', error)
        reject(error)
      })

      socket.on('disconnect', (reason) => {
        console.log('🔌 Global socket disconnected:', reason)
        // Don't auto-reconnect, let components handle it
      })

      socket.connect()
    })
  }

  getSocket(): Socket | null {
    return this.socket?.connected ? this.socket : null
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    this.connectionPromise = null
    this.isConnecting = false
  }
}

export function useInterviewWebSocket(props: UseInterviewWebSocketProps) {
  const {
    onInterviewStarted,
    onSttConnected,
    onInterimTranscript,
    onTranscript,
    onAudioGenerated,
    onInterviewComplete,
    onAudioChunk,
    onError,
    onNextQuestion,
  } = props

  const socketManager = useRef(GlobalSocketManager.getInstance())
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const handlersSetupRef = useRef(false)

  const setupEventHandlers = useCallback((socket: Socket) => {
    if (handlersSetupRef.current) {
      return // Already set up
    }

    console.log('🔧 Setting up socket event handlers')

    // Connection status handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected in hook')
      setIsConnected(true)
      setConnectionStatus('connected')
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected in hook:', reason)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      handlersSetupRef.current = false
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error in hook:', error)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      onError?.(error.message)
    })

    // Application event handlers
    if (onInterviewStarted) {
      socket.on('interviewStarted', onInterviewStarted)
    }
    if (onSttConnected) {
      socket.on('sttConnected', onSttConnected)
    }
    if (onInterimTranscript) {
      socket.on('interimTranscript', onInterimTranscript)
    }
    if (onTranscript) {
      socket.on('transcript', onTranscript)
    }
    if (onAudioGenerated) {
      socket.on('audioGenerated', onAudioGenerated)
    }
    if (onNextQuestion) {
      socket.on('nextQuestion', onNextQuestion)
    }
    if (onInterviewComplete) {
      socket.on('interviewComplete', onInterviewComplete)
    }
    if (onAudioChunk) {
      socket.on('audioChunk', onAudioChunk)
    }
    if (onError) {
      socket.on('error', onError)
    }

    handlersSetupRef.current = true
  }, [onInterviewStarted, onSttConnected, onInterimTranscript, onTranscript, onAudioGenerated, onInterviewComplete, onAudioChunk, onError])

  const connect = useCallback(async () => {
    if (socketManager.current.getSocket()?.connected) {
      console.log('✅ Already connected')
      const socket = socketManager.current.getSocket()!
      setupEventHandlers(socket)
      return Promise.resolve()
    }

    console.log('🌐 Attempting to connect...')
    setConnectionStatus('connecting')

    try {
      const socket = await socketManager.current.connect()
      setupEventHandlers(socket)
      console.log('✅ Connection established successfully')
    } catch (error) {
      console.error('Failed to connect:', error)
      setConnectionStatus('disconnected')
      setIsConnected(false)
      throw error
    }
  }, [setupEventHandlers])

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting...')
    socketManager.current.disconnect()
    setIsConnected(false)
    setConnectionStatus('disconnected')
    handlersSetupRef.current = false
  }, [])

  const sendMessage = useCallback((event: string, data?: any) => {
    console.log(`📤 Attempting to send message: ${event}`, data)
    
    const socket = socketManager.current.getSocket()
    if (!socket) {
      console.error("❌ Socket not available")
      return false
    }

    try {
      socket.emit(event, data)
      console.log(`✅ Message sent successfully: ${event}`)
      return true
    } catch (error) {
      console.error(`❌ Error sending message ${event}:`, error)
      return false
    }
  }, [])

  // Connect once on mount - Use empty dependency array to prevent re-runs
  useEffect(() => {
    let mounted = true

    const connectAsync = async () => {
      try {
        await connect()
        if (mounted) {
          // Update state if component is still mounted
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to connect on mount:', error)
        }
      }
    }

    connectAsync()

    return () => {
      mounted = false
      // Don't disconnect on unmount - let global manager handle it
      // This prevents disconnecting when other components are still using the socket
    }
  }, []) // Empty dependency array - only run once

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect,
    socket: socketManager.current.getSocket(),
  }
}