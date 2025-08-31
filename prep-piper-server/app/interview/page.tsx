"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ConnectionGuard } from "@/components/connection/connection-guard"
import { InterviewQuestion } from "@/components/interview/interview-question"
import { VoiceControls } from "@/components/interview/voice-controls"
import { TextInput } from "@/components/interview/text-input"
import { TranscriptDisplay } from "@/components/interview/transcript-display"
import { SessionStats } from "@/components/interview/session-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { TechSelection } from "@/lib/types"
import useInterview  from "@/hooks/useInterview"
import { ArrowLeft, RotateCcw } from "lucide-react"

export default function InterviewPage() {
  const router = useRouter()
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [techSelection, setTechSelection] = useState<TechSelection | null>(null)
  
  const {
    connectionState,
    interviewState,
    sessionId,
    question,
    questionIdx,
    totalQuestions,
    transcript,
    isRecording,
    error,
    isConnected,
    startInterview,
    startRecording,
    stopRecording,
    submitTextResponse,
    endInterview,
    clearError
  } = useInterview()

  // Load tech selection from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("prep-piper:selection")
      if (raw) {
        setTechSelection(JSON.parse(raw))
      } else {
        // No selection found, redirect to tech selection
        router.push("/tech-selection")
      }
    } catch {
      router.push("/tech-selection")
    }
  }, [router])

  const handleStartInterview = () => {
    if (!techSelection || !isConnected) return
    startInterview(techSelection)
  }

  const handleRestart = () => {
    router.push("/tech-selection")
  }

  const canStart = isConnected && interviewState === "idle" && techSelection

  return (
    <ConnectionGuard>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">Prep Piper Interview</h1>
            </div>
            
            {error && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-400">{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  ×
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="container mx-auto grid gap-6 p-6 lg:grid-cols-3">
          {/* Left Column: Question and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Question */}
            <InterviewQuestion 
              question={question || "Ready to start your interview?"}
              questionNumber={questionIdx}
              totalQuestions={totalQuestions}
            />

            {/* Start Interview Button */}
            {interviewState === "idle" && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                      {techSelection 
                        ? `Ready to interview for ${techSelection.position} position with ${techSelection.techs.join(", ")}`
                        : "Loading your preferences..."
                      }
                    </p>
                    <Button
                      onClick={handleStartInterview}
                      disabled={!canStart}
                      size="lg"
                      className="gap-2"
                    >
                      {connectionState === "connecting" 
                        ? "Connecting..." 
                        : "Start Interview"
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Input Controls */}
            {(interviewState === "active" || interviewState === "processing" || interviewState === "waiting_for_next") && (
              <Card>
                <CardContent className="p-6">
                  {/* Input Mode Toggle */}
                  <div className="mb-6 flex items-center justify-center gap-4">
                    <Label htmlFor="input-mode" className="text-sm">
                      Voice
                    </Label>
                    <Switch
                      id="input-mode"
                      checked={inputMode === "text"}
                      onCheckedChange={(checked) => 
                        setInputMode(checked ? "text" : "voice")
                      }
                    />
                    <Label htmlFor="input-mode" className="text-sm">
                      Text
                    </Label>
                  </div>

                  {/* Input Controls */}
                  {inputMode === "voice" ? (
                    <VoiceControls
                      isRecording={isRecording}
                      onStartRecording={startRecording}
                      onStopRecording={stopRecording}
                      disabled={interviewState !== "active"}
                    />
                  ) : (
                    <TextInput
                      onSubmit={submitTextResponse}
                      disabled={interviewState !== "active"}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Interview Complete */}
            {interviewState === "completed" && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-green-400">
                      🎉 Interview Complete!
                    </h2>
                    <p className="text-zinc-400">
                      Thank you for completing the interview. You can review your transcript on the right.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleRestart} variant="outline" className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        New Interview
                      </Button>
                      <Button onClick={() => router.push("/")} variant="default">
                        Go Home
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Stats and Transcript */}
          <div className="space-y-6">
            {/* Session Stats */}
            <SessionStats
              total={totalQuestions}
              current={questionIdx}
              connection={connectionState}
            />

            {/* Transcript Display */}
            <TranscriptDisplay transcript={transcript} />
          </div>
        </div>
      </div>
    </ConnectionGuard>
  )
}
