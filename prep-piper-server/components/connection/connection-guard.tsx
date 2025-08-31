"use client"

import React from "react"
import { ConnectionStatus } from "./connection-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSocket } from "@/hooks/useSocket"

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const { connectionState, connect, isConnected } = useSocket()

  if (connectionState !== "connected") {
    return (
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-pretty text-zinc-100">
            Preparing your interview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <ConnectionStatus state={connectionState} />
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 bg-transparent"
            onClick={() => {
              if (!isConnected) {
                connect()
              }
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
