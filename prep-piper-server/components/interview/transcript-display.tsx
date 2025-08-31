"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TranscriptState } from "@/lib/types"

export function TranscriptDisplay({ transcript }: { transcript: TranscriptState }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-zinc-100">Live Transcript</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transcript.final.length > 0 && (
          <div className="space-y-2">
            {transcript.final.map((line, idx) => (
              <p key={idx} className="text-zinc-200">
                {line}
              </p>
            ))}
          </div>
        )}
        {transcript.interim && <p className="italic text-zinc-400">{transcript.interim}</p>}
        {!transcript.interim && transcript.final.length === 0 && <p className="text-zinc-400">No transcript yet.</p>}
      </CardContent>
    </Card>
  )
}
