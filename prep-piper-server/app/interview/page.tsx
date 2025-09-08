// pages/interview/page.tsx
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
    liveTranscription,
    candidateResponseBuffer,
    isRecording,
    error,
    isConnected,
    elapsedSeconds,
    startInterview,
    startRecording,
    stopRecording,
    submitTextResponse,
    submitVoiceResponse,
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
      <div className=" bg-black text-white overflow-x-hidden relative">
        {/* Grid Background */}
        <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
        
        {/* Radial fade overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>

              {/* End Interview Button */}
              {isInterviewActive && (
                <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                      <StopCircle className="w-4 h-4" />
                      End Interview
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">End Interview Early?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Are you sure you want to end this interview? This action cannot be undone and your progress will not be saved completely.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                        Continue Interview
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleEndInterview} 
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        End Interview
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Ready to Begin?</h3>
                        <p className="text-gray-300">
                          {techSelection
                            ? `Interview for ${techSelection.position} position with ${techSelection.techs.join(", ")}`
                            : "Loading your preferences..."
                          }
                        </p>
                      </div>
                      <Button 
                        onClick={handleStartInterview}
                        disabled={!canStart}
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105 py-6 text-lg"
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
                  <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                    <CardContent className="p-6 space-y-6">
                      {/* Input Mode Toggle */}
                      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <Label htmlFor="input-mode" className="text-sm font-medium text-gray-300">
                          Voice
                        </Label>
                        <Switch
                          id="input-mode"
                          checked={inputMode === "text"}
                          onCheckedChange={(checked) => setInputMode(checked ? "text" : "voice")}
                          className="data-[state=checked]:bg-teal-500"
                        />
                        <Label htmlFor="input-mode" className="text-sm font-medium text-gray-300">
                          Text
                        </Label>
                      </div>

                      {/* Input Controls */}
                      {inputMode === "voice" ? (
                        <VoiceControls
                          isRecording={isRecording}
                          onStartRecording={startRecording}
                          onStopRecording={stopRecording}
                          onSubmitResponse={submitVoiceResponse}
                          interviewState={interviewState}
                          disabled={interviewState !== "active"}
                          candidateResponseBuffer={candidateResponseBuffer}
                          liveTranscription={liveTranscription}
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
                  <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-800/50 backdrop-blur">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-green-400">
                          🎉 Interview Complete!
                        </h3>
                        <p className="text-gray-300">
                          Thank you for completing the interview. You can review your transcript on the right.
                        </p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={handleRestart} 
                          variant="outline" 
                          className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          <RotateCcw className="w-4 h-4" />
                          New Interview
                        </Button>
                        <Button 
                          onClick={() => router.push("/")} 
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        >
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
                  error={error}
                  elapsedSeconds={elapsedSeconds}
                  onClearError={clearError}
                />

                {/* Transcript Display */}
                <TranscriptDisplay 
                  transcript={transcript}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConnectionGuard>
  )
}
