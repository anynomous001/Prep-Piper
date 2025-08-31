"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { getSocket } from "@/components/connection/socket-manager"
import { ConnectionGuard } from "@/components/connection/connection-guard"
import { InterviewQuestion } from "@/components/interview/interview-question"
import { DualInputControls } from "@/components/interview/dual-input-controls"
import { TranscriptDisplay } from "@/components/interview/transcript-display"
import { SessionStats } from "@/components/interview/session-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ConnectionState, InterviewState, TranscriptState, TechSelection } from "@/lib/types"
import { ConnectionStatus } from "@/components/connection/connection-status"

export default function InterviewPage() {
  // Connection state
  const [conn, setConn] = useState<ConnectionState>("connecting")

  // Interview state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<string>("")
  const [questionIdx, setQuestionIdx] = useState(0)
  const totalQuestions = 5
  const [interviewState, setInterviewState] = useState<InterviewState>("idle")

  // Transcript
  const [transcript, setTranscript] = useState<TranscriptState>({ interim: "", final: [] })

  const selectionRef = useRef<TechSelection | null>(null)
  const socket = useMemo(() => getSocket(), [])

  // Connection monitoring
  useEffect(() => {
    const onConnect = () => setConn("connected")
    const onDisconnect = () => setConn("disconnected")
    const onError = () => setConn("error")
    const onConnecting = () => setConn("connecting")

    if (socket.connected) setConn("connected")
    else setConn("connecting")

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onError)
    socket.io.on("reconnect_attempt", onConnecting)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onError)
      socket.io.off("reconnect_attempt", onConnecting)
    }
  }, [socket])

  // Event handlers
  useEffect(() => {
    const onInterviewStarted = (payload: { sessionId: string; question: string }) => {
      setSessionId(payload.sessionId)
      setQuestion(payload.question)
      setQuestionIdx(1)
      setInterviewState("active")
    }

    const onNextQuestion = (payload: { question: string }) => {
      setQuestion(payload.question)
      setQuestionIdx((i) => Math.min(i + 1, totalQuestions))
      setInterviewState("active")
    }

    const onInterviewComplete = (payload: { summary?: string }) => {
      setInterviewState("completed")
      if (payload?.summary) {
        setTranscript((t) => ({ interim: "", final: [...t.final, `Summary: ${payload.summary}`] }))
      }
    }

    const onInterim = (payload: { text: string }) => {
      setTranscript((t) => ({ ...t, interim: payload.text }))
      setInterviewState("processing")
    }

    const onFinal = (payload: { text: string }) => {
      setTranscript((t) => ({ interim: "", final: [...t.final, payload.text] }))
      setInterviewState("waiting_for_next")
    }

    const onError = (payload: { message: string }) => {
      setInterviewState("idle")
      setTranscript((t) => ({ ...t, interim: "" }))
      console.error("[v0] interview error", payload?.message)
    }

    // Optional hooks for integration visibility
    const onSttConnected = () => {
      setTranscript((t) => ({ ...t, final: [...t.final, "[STT connected]"] }))
    }

    socket.on("interviewStarted", onInterviewStarted)
    socket.on("nextQuestion", onNextQuestion)
    socket.on("interviewComplete", onInterviewComplete)
    socket.on("interimTranscript", onInterim)
    socket.on("transcript", onFinal)
    socket.on("sttConnected", onSttConnected)
    socket.on("error", onError)

    return () => {
      socket.off("interviewStarted", onInterviewStarted)
      socket.off("nextQuestion", onNextQuestion)
      socket.off("interviewComplete", onInterviewComplete)
      socket.off("interimTranscript", onInterim)
      socket.off("transcript", onFinal)
      socket.off("sttConnected", onSttConnected)
      socket.off("error", onError)
    }
  }, [socket])

  // Pre-flight: load selection
  useEffect(() => {
    try {
      const raw = localStorage.getItem("prep-piper:selection")
      if (raw) selectionRef.current = JSON.parse(raw) as TechSelection
    } catch {}
  }, [])

  const startInterview = () => {
    if (conn !== "connected") return
    const selection = selectionRef.current || {
      position: "Software Developer",
      techs: ["JavaScript", "React"],
      experience: "intermediate" as const,
    }
    setInterviewState("connecting")
    socket.emit("startInterview", selection)
  }

  const canStart = conn === "connected" && interviewState === "idle"

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-lg font-semibold text-zinc-100">Prep Piper</div>
        <ConnectionStatus state={conn} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left: Question and Controls */}
        <div className="col-span-2 space-y-6">
          <ConnectionGuard>
            <InterviewQuestion question={question} />
            <Card className="border-zinc-800 bg-zinc-950">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="space-y-1">
                  <p className="text-zinc-300">{sessionId ? "Session ready" : "Ready to start your interview"}</p>
                  <p className="text-sm text-zinc-500">
                    {questionIdx > 0 ? `Question ${questionIdx} of ${totalQuestions}` : "5-question interview"}
                  </p>
                </div>
                <Button
                  onClick={startInterview}
                  disabled={!canStart}
                  className="bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-50"
                >
                  {sessionId ? "Resume" : "Start Interview"}
                </Button>
              </CardContent>
            </Card>

            <DualInputControls disabled={interviewState === "completed" || conn !== "connected"} />
          </ConnectionGuard>
        </div>

        {/* Right: Stats + Transcript */}
        <div className="space-y-6">
          <SessionStats total={totalQuestions} current={questionIdx} connection={conn} />
          <TranscriptDisplay transcript={transcript} />
        </div>
      </div>
    </main>
  )
}
