"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TranscriptState } from "@/lib/types"

interface TranscriptDisplayProps {
  transcript: TranscriptState
  // UPDATE: Remove liveTranscription prop - now handled in VoiceControls component
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  return (
    <div className="space-y-4">
      {/* UPDATE: Remove Live Transcription Section - moved to VoiceControls */}
      
      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-base">Interview Transcript</span>
            {transcript.messages.length > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {transcript.messages.length} messages
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {transcript.messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Conversation history will appear here during the interview...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcript.messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === "interviewer"
                      ? "bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500"
                      : "bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {message.role === "interviewer" ? "🎤 Interviewer" : "👤 You"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}