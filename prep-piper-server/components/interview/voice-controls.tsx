"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { getSocket } from "@/components/connection/socket-manager"

export function VoiceControls({ disabled }: { disabled?: boolean }) {
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const start = async () => {
    const socket = getSocket()
    if (!socket.connected) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })
      mediaRecorderRef.current = mr
      mr.ondataavailable = async (evt) => {
        if (!evt.data || evt.data.size === 0) return
        const arrayBuf = await evt.data.arrayBuffer()
        socket.emit("audioChunk", {
          chunk: arrayBuf,
          mimeType: evt.data.type || "audio/webm;codecs=opus",
        })
      }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start(300) // chunk every 300ms
      setRecording(true)
    } catch (e) {
      console.error("[v0] mic error", e)
      setRecording(false)
    }
  }

  const stop = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={recording ? stop : start}
        disabled={disabled}
        className={`text-white ${recording ? "bg-teal-500 hover:bg-teal-400" : "bg-blue-500 hover:bg-blue-400"}`}
        aria-pressed={recording}
        aria-label={recording ? "Stop recording" : "Start recording"}
      >
        {recording ? "Stop" : "Record"}
      </Button>
      <div
        aria-hidden="true"
        className={`h-3 w-3 rounded-full ${recording ? "bg-teal-400 animate-ping" : "bg-zinc-600"}`}
      />
    </div>
  )
}
