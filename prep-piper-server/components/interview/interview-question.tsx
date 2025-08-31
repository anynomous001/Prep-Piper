"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InterviewQuestion({ question }: { question: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-pretty text-zinc-100">Question</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-200">{question || "Waiting for question..."}</p>
      </CardContent>
    </Card>
  )
}
