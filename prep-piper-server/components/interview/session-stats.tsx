// components/interview/session-stats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff, Activity, Hash, User } from "lucide-react"
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
  elapsedSeconds: number
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
  const progress = interviewState === "idle" ? "0" : questionIdx.toString()

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  const getConnectionStatus = () => {
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
          badge: "secondary",
          color: "text-gray-400"
        }
      case "connecting":
        return {
          text: "Starting...",
          badge: "secondary",
          color: "text-yellow-400"
        }
      case "active":
        return {
          text: "Active",
          badge: "default",
          color: "text-teal-400"
        }
      case "processing":
        return {
          text: "Processing...",
          badge: "secondary",
          color: "text-blue-400"
        }
      case "waiting_for_next":
        return {
          text: "Waiting",
          badge: "secondary",
          color: "text-orange-400"
        }
      case "completed":
        return {
          text: "Completed",
          badge: "default",
          color: "text-green-400"
        }
      default:
        return {
          text: "Unknown",
          badge: "secondary",
          color: "text-gray-400"
        }
    }
  }

  const stateDisplay = getInterviewStateDisplay()

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          Session Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer */}
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Timer</span>
          </div>
          <span className="font-mono text-lg text-white">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Progress</span>
          </div>
          <span className="font-semibold text-white">
            {progress}/{totalQuestions}
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Connection</span>
          </div>
          <div className="flex items-center gap-2">
            {connectionDisplay.icon}
            <Badge 
              variant={connectionDisplay.badge as any}
              className={
                actualConnectionState === "connected" 
                  ? "bg-green-800 text-green-200 border-green-700"
                  : actualConnectionState === "connecting"
                  ? "bg-yellow-800 text-yellow-200 border-yellow-700"
                  : "bg-red-800 text-red-200 border-red-700"
              }
            >
              {connectionDisplay.text}
            </Badge>
          </div>
        </div>

        {/* Interview State */}
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              interviewState === "active" ? "bg-teal-500" :
              interviewState === "processing" ? "bg-blue-500" :
              interviewState === "completed" ? "bg-green-500" :
              "bg-gray-500"
            }`} />
            <span className={`text-sm font-medium ${stateDisplay.color}`}>
              {stateDisplay.text}
            </span>
          </div>
        </div>

        {/* Session ID */}
        {sessionId && (
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Session</span>
            </div>
            <span className="font-mono text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-600">
              {sessionId}
            </span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-200 mb-2">{error}</p>
                <button
                  onClick={onClearError}
                  className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
