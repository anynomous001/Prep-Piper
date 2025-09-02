"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TranscriptState } from "@/lib/types"

interface TranscriptDisplayProps {
  transcript: TranscriptState
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-zinc-100">Interview Transcript</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {transcript.messages.length === 0 && (
          <p className="text-zinc-500 text-sm">
            Transcript will appear here during the interview...
          </p>
        )}
        
        {transcript.messages.map((message, index) => (
          <div key={index} className="space-y-1">
            <div className={`text-sm p-3 rounded-lg ${
              message.role === "interviewer" 
                ? "bg-blue-900/20 border-l-4 border-blue-500" 
                : "bg-green-900/20 border-l-4 border-green-500"
            }`}>
              <div className={`font-semibold text-xs mb-1 ${
                message.role === "interviewer" ? "text-blue-300" : "text-green-300"
              }`}>
                {message.role === "interviewer" ? "🎤 Interviewer" : "👤 You"}
              </div>
              <div className="text-zinc-200 whitespace-pre-wrap">
                {message.text}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {transcript.interim && (
          <div className="bg-zinc-800/50 p-3 rounded-lg border-l-4 border-yellow-500">
            <div className="font-semibold text-xs mb-1 text-yellow-300">
              🎙️ Listening...
            </div>
            <div className="text-zinc-300 italic">
              {transcript.interim}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
