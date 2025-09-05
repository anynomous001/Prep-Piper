"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react"
import type { InterviewState } from "@/lib/types"
import type { ConnectionState } from "@/hooks/useSocket"

interface SessionStatsProps {
  sessionId: string | null
  questionIdx: number
  totalQuestions: number
  interviewState: InterviewState
  connectionState: ConnectionState
  error: string | null
  onClearError: () => void
  elapsedSeconds: number // UPDATE: Add elapsed time prop
}

export function SessionStats({
  sessionId,
  questionIdx,
  totalQuestions,
  interviewState,
  connectionState,
  error,
  elapsedSeconds,
  onClearError
}: SessionStatsProps) {
  // UPDATE: Fix progress calculation - handle case when interview hasn't started
  const progress = interviewState === "idle" ? "0" : questionIdx.toString()


  function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}


  // UPDATE: Better connection status logic
  const getConnectionStatus = () => {
    // If interview is active, show as connected regardless of connectionState
    if (interviewState === "active" || interviewState === "processing" || interviewState === "waiting_for_next") {
      return "connected"
    }
    return connectionState
  }

  const actualConnectionState = getConnectionStatus()

  const getConnectionDisplay = () => {
    switch (actualConnectionState) {
      case "connected":
        return {
          text: "Connected",
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          badge: "default"
        }
      case "connecting":
        return {
          text: "Connecting",
          icon: <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />,
          badge: "secondary"
        }
      case "disconnected":
        return {
          text: "Disconnected",
          icon: <WifiOff className="w-4 h-4 text-red-500" />,
          badge: "destructive"
        }
      case "error":
        return {
          text: "Connection Error",
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          badge: "destructive"
        }
      default:
        return {
          text: "Unknown",
          icon: <WifiOff className="w-4 h-4 text-gray-500" />,
          badge: "secondary"
        }
    }
  }

  const connectionDisplay = getConnectionDisplay()

  const getInterviewStateDisplay = () => {
    switch (interviewState) {
      case "idle":
        return {
          text: "Ready to Start",
          badge: "secondary"
        }
      case "connecting":
        return {
          text: "Starting...",
          badge: "secondary"
        }
      case "active":
        return {
          text: "Active",
          badge: "default"
        }
      case "processing":
        return {
          text: "Processing...",
          badge: "secondary"
        }
      case "waiting_for_next":
        return {
          text: "Waiting",
          badge: "secondary"
        }
      case "completed":
        return {
          text: "Completed",
          badge: "default"
        }
      default:
        return {
          text: "Unknown",
          badge: "secondary"
        }
    }
  }

  const stateDisplay = getInterviewStateDisplay()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Session Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Timer</span>
         <span className="font-mono text-lg">
    {formatTime(elapsedSeconds)}
  </span>
        </div>

        {/* Progress - UPDATE: Fixed progress display */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-semibold">
            {progress}/{totalQuestions}
          </span>
        </div>

        {/* Connection Status - UPDATE: Fixed connection logic */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
          <div className="flex items-center gap-2">
            {connectionDisplay.icon}
            <Badge variant={connectionDisplay.badge as any}>
              {connectionDisplay.text}
            </Badge>
          </div>
        </div>

        {/* Interview State */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <Badge variant={stateDisplay.badge as any}>
            {stateDisplay.text}
          </Badge>
        </div>

        {/* Session ID */}
        {sessionId && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Session</span>
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {sessionId}
            </span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
                <button
                  onClick={onClearError}
                  className="text-xs text-red-600 dark:text-red-400 underline mt-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}