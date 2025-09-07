// components/interview/transcript-display.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, User, Bot } from "lucide-react"
import type { TranscriptState } from "@/lib/types"

interface TranscriptDisplayProps {
  transcript: TranscriptState
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-teal-400" />
          Interview Transcript
          {transcript.messages.length > 0 && (
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">
              {transcript.messages.length} messages
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-6 pb-6">
          {transcript.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">
                Conversation history will appear here during the interview...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcript.messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors ${
                    message.role === "interviewer"
                      ? "bg-gray-800/50 border-gray-700 border-l-4 border-l-blue-500"
                      : "bg-teal-900/20 border-teal-800/50 border-l-4 border-l-teal-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {message.role === "interviewer" ? (
                        <Bot className="w-4 h-4 text-blue-400" />
                      ) : (
                        <User className="w-4 h-4 text-teal-400" />
                      )}
                      <span className="text-sm font-medium text-gray-300">
                        {message.role === "interviewer" ? "🎤 Interviewer" : "👤 You"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
