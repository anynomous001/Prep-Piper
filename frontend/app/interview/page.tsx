"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, RotateCcw, Home, Brain, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { InterviewQuestion } from "@/components/interview/interview-question"
import { TranscriptDisplay } from "@/components/interview/transcript-display"
import { AudioControls } from "@/components/interview/audio-controls"
import { MicrophoneControls } from "@/components/interview/microphone-controls"
import { ConnectionStatus } from "@/components/interview/connection-status"
import { useInterview } from "@/hooks/use-interview"

export default function InterviewPage() {
  const {
    session,
    currentQuestion,
    transcript,
    interimTranscript,
    isRecording,
    isPlaying,
    audioUrl,
    interviewState,
    progress,
    error,
    isConnected,
    startInterview,
    stopRecording,
    startRecording,
    playAudio,
    pauseAudio,
    nextQuestion,
    endInterview,
    clearError,
  } = useInterview()

  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (interviewState === "active") {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [interviewState])


  console.log(interviewState,'<INTERVIEW_STATE>')
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

   const playRawPCM = useCallback(async (url: string) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioCtx = new AudioContext({ sampleRate: 24000 })
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtx.destination)
    source.start()
  }, [])

 const handlePlay = () => {
    if (audioUrl?.endsWith(".l16")) {
      playRawPCM(audioUrl)
    } else {
      playAudio()
    }
  }

  if (interviewState === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <ConnectionStatus isConnected={isConnected} error={error} />

        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-800">Ready to Start Your Interview?</CardTitle>
            <p className="text-slate-600 text-lg leading-relaxed">
              Get ready for a personalized AI interview experience. We'll ask you tailored questions and provide
              real-time feedback.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">Connection Error</p>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button
                  onClick={clearError}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-800">AI Questions</h3>
                <p className="text-sm text-slate-600">Personalized for your role</p>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-xl">
                <Mic className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-800">Voice Practice</h3>
                <p className="text-sm text-slate-600">Real-time speech analysis</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-800">Instant Feedback</h3>
                <p className="text-sm text-slate-600">Improve as you practice</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => startInterview()}
                disabled={!isConnected}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 text-lg font-semibold group transition-all duration-300 hover:scale-105"
              >
                <Brain className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                {isConnected ? "Start Interview" : "Connecting..."}
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-slate-300 text-slate-700 py-4 text-lg hover:bg-slate-50 bg-transparent"
                >
                  <Home className="mr-2 w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <ConnectionStatus isConnected={isConnected} error={error} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-slate-800">Prep Piper</span>
              </Link>
              <Badge className="bg-green-100 text-green-700 animate-pulse">Live Session</Badge>
              {session && (
                <Badge variant="outline" className="text-xs">
                  Session: {session.id.slice(-8)}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(sessionTime)}</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-slate-600">Progress:</span>
                <div className="w-24">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
              </div>
              <Button
                onClick={endInterview}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            <InterviewQuestion
              question={currentQuestion}
              questionNumber={Math.floor(progress / 20) + 1}
              totalQuestions={5}
            />

            {/* Audio Controls */}
             <AudioControls
      audioUrl={audioUrl}
      isPlaying={isPlaying}
      onPlay={handlePlay}
      onPause={pauseAudio}
    />
            {/* <AudioControls audioUrl={audioUrl} isPlaying={isPlaying} onPlay={playAudio} onPause={pauseAudio} /> */}

            {/* Microphone Controls */}
            <MicrophoneControls
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              interviewState={interviewState}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={nextQuestion}
                disabled={interviewState !== "waiting_for_next"}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 font-semibold group transition-all duration-300"
              >
                Next Question
                <CheckCircle2 className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 py-3 hover:bg-slate-50 bg-transparent"
              >
                <RotateCcw className="mr-2 w-5 h-5" />
                Restart
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transcript Display */}
            <TranscriptDisplay
              transcript={transcript}
              interimTranscript={interimTranscript}
              isRecording={isRecording}
            />

            {/* Session Stats */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                  <Brain className="mr-2 w-5 h-5 text-blue-600" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Questions Answered</span>
                  <Badge className="bg-blue-100 text-blue-700">{Math.floor(progress / 20)}/5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Session Time</span>
                  <span className="font-mono text-slate-800">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <Badge
                    className={
                      interviewState === "active"
                        ? "bg-green-100 text-green-700"
                        : interviewState === "processing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }
                  >
                    {interviewState === "active"
                      ? "Active"
                      : interviewState === "processing"
                        ? "Processing"
                        : "Waiting"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Connection</span>
                  <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-teal-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                  <AlertCircle className="mr-2 w-5 h-5 text-blue-600" />
                  Interview Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Speak clearly and at a moderate pace</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Use the STAR method for behavioral questions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Take a moment to think before answering</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Be specific with examples and metrics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
