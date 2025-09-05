"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Send, MicOff } from "lucide-react"
import type { InterviewState } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface VoiceControlsProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onSubmitResponse: () => void
  interviewState: InterviewState
  disabled: boolean
  candidateResponseBuffer?: string // UPDATE: Add buffer prop to show pending response
  liveTranscription?: string // UPDATE: Add live transcription prop
}

export function VoiceControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSubmitResponse,
  interviewState,
  disabled,
  candidateResponseBuffer = "", // UPDATE: Default empty string
  liveTranscription = "" // UPDATE: Default empty string
}: VoiceControlsProps) {
  // UPDATE: Determine if there's a pending response to submit
  const hasPendingResponse = candidateResponseBuffer.trim().length > 0
  const isProcessing = interviewState === "processing"

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* UPDATE: Live Transcription Display */}
        {(liveTranscription || isRecording) && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${liveTranscription ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Live Transcription
              </span>
            </div>
            <div className="bg-white dark:bg-blue-900/20 rounded-md p-3 min-h-[40px]">
              {liveTranscription ? (
                <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                  {liveTranscription}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRecording ? "Listening..." : "Start speaking to see transcription"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* UPDATE: Pending Response Display */}
        {hasPendingResponse && !isRecording && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ready to Submit
              </Badge>
            </div>
            <div className="bg-white dark:bg-green-900/20 rounded-md p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                {candidateResponseBuffer.length > 200 
                  ? `${candidateResponseBuffer.substring(0, 200)}...` 
                  : candidateResponseBuffer
                }
              </p>
            </div>
          </div>
        )}

        {/* UPDATE: Recording Controls - Updated flow */}
        <div className="flex flex-col gap-3">
          {!isRecording && !hasPendingResponse && (
            // Initial state - can start recording
            <Button
              onClick={onStartRecording}
              disabled={disabled || isProcessing}
              size="lg"
              className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            // Recording in progress - can stop
            <Button
              onClick={onStopRecording}
              size="lg"
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </Button>
          )}

          {!isRecording && hasPendingResponse && (
            // UPDATE: Recording stopped with pending response - show submit and re-record options
            <div className="flex gap-2">
              <Button
                onClick={onSubmitResponse}
                disabled={disabled || isProcessing}
                size="lg"
                className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                {isProcessing ? "Submitting..." : "Submit Response"}
              </Button>
              
              <Button
                onClick={onStartRecording}
                disabled={disabled || isProcessing}
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Record Again
              </Button>
            </div>
          )}

          {isProcessing && (
            // Processing state
            <Button
              disabled
              size="lg"
              className="w-full flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Response...
            </Button>
          )}
        </div>

        {/* UPDATE: Status indicators */}
        <div className="flex justify-center">
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <MicOff className="w-3 h-3 mr-1" />
              Recording Active
            </Badge>
          )}
          {hasPendingResponse && !isRecording && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Response Ready
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="default">
              Processing...
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}