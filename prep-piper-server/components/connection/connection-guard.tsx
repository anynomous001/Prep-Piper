"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { ConnectionState } from "@/lib/types"
import { getSocket } from "./socket-manager"
import { ConnectionStatus } from "./connection-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConnectionState>("connecting")

  useEffect(() => {
    const socket = getSocket()
    const onConnect = () => setState("connected")
    const onConnecting = () => setState("connecting")
    const onDisconnect = () => setState("disconnected")
    const onError = () => setState("error")

    if (socket.connected) setState("connected")
    else setState("connecting")

    socket.on("connect", onConnect)
    socket.io.on("reconnect_attempt", onConnecting)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onError)

    return () => {
      socket.off("connect", onConnect)
      socket.io.off("reconnect_attempt", onConnecting)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onError)
    }
  }, [])

  if (state !== "connected") {
    return (
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-pretty text-zinc-100">Preparing your interview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <ConnectionStatus state={state} />
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 bg-transparent"
            onClick={() => {
              const s = getSocket()
              if (!s.connected) s.connect()
            }}
          >
            Retry connection
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
