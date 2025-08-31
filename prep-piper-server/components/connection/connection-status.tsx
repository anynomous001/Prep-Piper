"use client"

import { Badge } from "@/components/ui/badge"
import type { ConnectionState } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ConnectionStatus({ state, className }: { state: ConnectionState; className?: string }) {
  const label =
    state === "connected"
      ? "Connected"
      : state === "connecting"
        ? "Connecting"
        : state === "error"
          ? "Error"
          : "Disconnected"

  const dot =
    state === "connected"
      ? "bg-teal-500"
      : state === "connecting"
        ? "bg-blue-500 animate-pulse"
        : state === "error"
          ? "bg-red-500"
          : "bg-muted-foreground/40"

  const badge =
    state === "connected"
      ? "bg-teal-500 text-white"
      : state === "connecting"
        ? "bg-blue-500 text-white"
        : state === "error"
          ? "bg-red-500 text-white"
          : "bg-muted-foreground/30 text-foreground"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", dot)} />
      <Badge className={cn("font-medium", badge)} aria-live="polite" aria-atomic="true">
        {label}
      </Badge>
    </div>
  )
}
