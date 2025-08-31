"use client"

import { io, type Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export function getSocket(): Socket {
  // Use NEXT_PUBLIC_WS_URL if provided, else default to localhost dev server
  const base = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
  // Socket.io handles ws upgrade itself; pass HTTP URL
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(base, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    })
  }
  return socketInstance
}
