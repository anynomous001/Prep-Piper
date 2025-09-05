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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { TechSelection } from "@/lib/types"
import useInterview from "@/hooks/useInterview"
import { ArrowLeft, RotateCcw, StopCircle } from "lucide-react"

export default function InterviewPage() {
  const router = useRouter()
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [techSelection, setTechSelection] = useState<TechSelection | null>(null)
  const [showEndDialog, setShowEndDialog] = useState(false)

  const {
    connectionState,
    interviewState,
    sessionId,
    question,
    questionIdx,
    totalQuestions,
    transcript,
    liveTranscription, // Live transcription for VoiceControls
    candidateResponseBuffer, // UPDATE: Buffer for VoiceControls
    isRecording,
    error,
    isConnected,
    elapsedSeconds,
    startInterview,
    startRecording,
    stopRecording,
    submitTextResponse,
    submitVoiceResponse, // UPDATE: Now manual submission only
    endInterview, // UPDATE: Agent handles response message
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

  const handleEndInterview = () => {
    endInterview()
    setShowEndDialog(false)
  }

  const canStart = isConnected && interviewState === "idle" && techSelection
  const isInterviewActive = interviewState === "active" || interviewState === "processing" || interviewState === "waiting_for_next"

  return (
    <ConnectionGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            {/* End Interview Button - Show only when interview is active */}
            {isInterviewActive && (
              <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <StopCircle className="w-4 h-4" />
                    End Interview
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End Interview Early?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to end this interview? This action cannot be undone and your progress will not be saved completely.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndInterview} className="bg-red-600 hover:bg-red-700">
                      End Interview
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Question and Controls */}
            <div className="space-y-6">
              {/* Interview Question */}
              <InterviewQuestion 
                question={question}
                questionIdx={questionIdx}
                totalQuestions={totalQuestions}
                interviewState={interviewState}
              />

              {/* Start Interview Button */}
              {interviewState === "idle" && (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {techSelection
                        ? `Ready to interview for ${techSelection.position} position with ${techSelection.techs.join(", ")}`
                        : "Loading your preferences..."
                      }
                    </p>
                    <Button 
                      onClick={handleStartInterview}
                      disabled={!canStart}
                      size="lg"
                      className="w-full"
                    >
                      {connectionState === "connecting" 
                        ? "Connecting..." 
                        : "Start Interview"
                      }
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Input Controls */}
              {isInterviewActive && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {/* Input Mode Toggle */}
                    <div className="flex items-center justify-center space-x-4">
                      <Label htmlFor="input-mode" className="text-sm font-medium">
                        Voice
                      </Label>
                      <Switch
                        id="input-mode"
                        checked={inputMode === "text"}
                        onCheckedChange={(checked) => setInputMode(checked ? "text" : "voice")}
                      />
                      <Label htmlFor="input-mode" className="text-sm font-medium">
                        Text
                      </Label>
                    </div>

                    {/* Input Controls */}
                    {inputMode === "voice" ? (
                      // UPDATE: Pass new props to VoiceControls
                      <VoiceControls
                        isRecording={isRecording}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                        onSubmitResponse={submitVoiceResponse}
                        interviewState={interviewState}
                        disabled={interviewState !== "active"}
                        candidateResponseBuffer={candidateResponseBuffer} // UPDATE: Pass buffer
                        liveTranscription={liveTranscription} // UPDATE: Pass live transcription
                      />
                    ) : (
                      <TextInput
                        onSubmit={submitTextResponse}
                        disabled={interviewState !== "active"}
                        placeholder="Type your response here..."
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Interview Complete */}
              {interviewState === "completed" && (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                      🎉 Interview Complete!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thank you for completing the interview. You can review your transcript on the right.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleRestart} variant="outline" className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        New Interview
                      </Button>
                      <Button onClick={() => router.push("/")} variant="default">
                        Go Home
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Stats and Transcript */}
            <div className="space-y-6">
              {/* Session Stats */}
              <SessionStats 
                sessionId={sessionId}
                questionIdx={questionIdx}
                totalQuestions={totalQuestions}
                interviewState={interviewState}
                connectionState={connectionState}
                  elapsedSeconds={elapsedSeconds}

                error={error}
                onClearError={clearError}
              />

              {/* UPDATE: Simplified Transcript Display - live transcription moved to VoiceControls */}
              <TranscriptDisplay 
                transcript={transcript}
              />
            </div>
          </div>
        </div>
      </div>
    </ConnectionGuard>
  )
}