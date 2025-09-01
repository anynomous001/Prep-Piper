"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatus } from "@/components/connection/connection-status"
import type { ConnectionState } from "@/lib/types"

export function SessionStats({
  total,
  current,
  connection,
}: { total: number; current: number; connection: ConnectionState }) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-zinc-100"> </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between text-zinc-300">
          <span>Timer</span>
          <span className="font-mono text-zinc-100">
            {mm}:{ss}
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-300">
          <span>Progress</span>
          <span className="text-zinc-100">
            {Math.min(current, total)} / {total}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-300">Connection</span>
          <ConnectionStatus state={connection} />
        </div>
      </CardContent>
    </Card>
  )
}
