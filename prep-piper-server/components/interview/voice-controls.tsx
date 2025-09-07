// components/interview/voice-controls.tsx
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
  candidateResponseBuffer?: string
  liveTranscription?: string
}

export function VoiceControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSubmitResponse,
  interviewState,
  disabled,
  candidateResponseBuffer = "",
  liveTranscription = ""
}: VoiceControlsProps) {
  const hasPendingResponse = candidateResponseBuffer.trim().length > 0
  const isProcessing = interviewState === "processing"

  return (
    <div className="space-y-4">
      {/* Live Transcription Display */}
      {(liveTranscription || isRecording) && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${liveTranscription ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-blue-300">Live Transcription</span>
          </div>
          <div className="bg-gray-900/50 rounded-md p-3 min-h-[60px] border border-gray-700">
            {liveTranscription ? (
              <p className="text-sm text-blue-200 italic">{liveTranscription}</p>
            ) : (
              <p className="text-xs text-gray-400">
                {isRecording ? "Listening..." : "Start speaking to see transcription"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pending Response Display */}
      {hasPendingResponse && !isRecording && (
        <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-green-800 text-green-200 border-green-700">
              Ready to Submit
            </Badge>
          </div>
          <div className="bg-gray-900/50 rounded-md p-3 border border-gray-700">
            <p className="text-sm text-green-200">
              {candidateResponseBuffer.length > 200 
                ? `${candidateResponseBuffer.substring(0, 200)}...` 
                : candidateResponseBuffer
              }
            </p>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="space-y-3">
        {!isRecording && !hasPendingResponse && (
          <Button
            onClick={onStartRecording}
            disabled={disabled || isProcessing}
            size="lg"
            className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={onStopRecording}
            size="lg"
            variant="destructive"
            className="w-full flex items-center gap-2 py-6 text-lg"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </Button>
        )}

        {!isRecording && hasPendingResponse && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onSubmitResponse}
              disabled={disabled || isProcessing}
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6"
            >
              <Send className="w-4 h-4" />
              {isProcessing ? "Submitting..." : "Submit"}
            </Button>
            
            <Button
              onClick={onStartRecording}
              disabled={disabled || isProcessing}
              size="lg"
              variant="outline"
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 py-6"
            >
              <Mic className="w-4 h-4" />
              Record Again
            </Button>
          </div>
        )}

        {isProcessing && (
          <Button
            disabled
            size="lg"
            className="w-full flex items-center gap-2 py-6 text-lg"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Response...
          </Button>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex justify-center">
        {isRecording && (
          <Badge variant="destructive" className="animate-pulse bg-red-600">
            <MicOff className="w-3 h-3 mr-1" />
            Recording Active
          </Badge>
        )}
        {hasPendingResponse && !isRecording && (
          <Badge variant="secondary" className="bg-yellow-800 text-yellow-200 border-yellow-700">
            Response Ready
          </Badge>
        )}
        {isProcessing && (
          <Badge variant="default" className="bg-teal-600">
            Processing...
          </Badge>
        )}
      </div>
    </div>
  )
}
