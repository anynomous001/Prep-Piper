"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private static instance: Socket | null = null
  private static connecting = false
  private static reconnectAttempts = 0
  private static maxReconnectAttempts = 5

  static async getInstance(): Promise<Socket> {
    if (SocketManager.instance?.connected) {
      return SocketManager.instance
    }

    if (SocketManager.connecting) {
      // Wait for current connection attempt
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (SocketManager.instance?.connected) {
            resolve(SocketManager.instance)
          } else if (!SocketManager.connecting) {
            // Connection failed, try again
            SocketManager.getInstance().then(resolve).catch(reject)
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
      })
    }

    SocketManager.connecting = true

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
      
      if (SocketManager.instance) {
        SocketManager.instance.removeAllListeners()
        SocketManager.instance.disconnect()
      }

      SocketManager.instance = io(wsUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: SocketManager.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        autoConnect: false,
        forceNew: true,
      })

      return new Promise((resolve, reject) => {
        const socket = SocketManager.instance!

        const connectTimeout = setTimeout(() => {
          SocketManager.connecting = false
          reject(new Error('Connection timeout'))
        }, 10000)

        socket.on('connect', () => {
          clearTimeout(connectTimeout)
          SocketManager.connecting = false
          SocketManager.reconnectAttempts = 0
          console.log('✅ Socket connected successfully')
          resolve(socket)
        })

        socket.on('connect_error', (error) => {
          clearTimeout(connectTimeout)
          SocketManager.connecting = false
          SocketManager.reconnectAttempts++
          
          console.error('❌ Socket connection error:', error)
          
          if (SocketManager.reconnectAttempts >= SocketManager.maxReconnectAttempts) {
            reject(new Error('Max reconnection attempts reached'))
          } else {
            // Exponential backoff retry
            const delay = Math.min(1000 * Math.pow(2, SocketManager.reconnectAttempts - 1), 5000)
            setTimeout(() => {
              SocketManager.getInstance().then(resolve).catch(reject)
            }, delay)
          }
        })

        socket.connect()
      })
    } catch (error) {
      SocketManager.connecting = false
      throw error
    }
  }

  static disconnect(): void {
    if (SocketManager.instance) {
      SocketManager.instance.removeAllListeners()
      SocketManager.instance.disconnect()
      SocketManager.instance = null
    }
    SocketManager.connecting = false
    SocketManager.reconnectAttempts = 0
  }
}

// Legacy function for backward compatibility
export function getSocket(): Socket {
  // This should not be used in new code, use useSocket hook instead
  throw new Error("Use useSocket hook instead of getSocket")
}

export { SocketManager }
