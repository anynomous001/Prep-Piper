"use client"

import { Button } from "@/components/ui/button"
import { Mic, Square, Send, MicOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface VoiceControlsProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onSendRecording: () => void
  disabled?: boolean
}

export function VoiceControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onSendRecording,
  disabled
}: VoiceControlsProps) {
  const micButtonVariants = {
    idle: { scale: 1, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" },
    recording: {
      scale: [1, 1.1, 1],
      boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
      transition: { scale: { duration: 1, repeat: Infinity }, boxShadow: { duration: 0.3 } },
    },
    disabled: { scale: 1, boxShadow: "0 2px 10px rgba(148, 163, 184, 0.2)" },
  }

  const pulseVariants = {
    recording: {
      scale: [1, 2, 3],
      opacity: [0.7, 0.3, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeOut" },
    },
  }

  // Cleanup if unmounted mid-recording
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const streamRef = useRef<MediaStream|null>(null)
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop()
      }
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <motion.div
          variants={micButtonVariants}
          animate={disabled ? "disabled" : isRecording ? "recording" : "idle"}
          className="relative"
        >
          <Button
            onClick={onStartRecording}
            disabled={disabled || isRecording}
            size="lg"
            variant="default"
            className="relative h-16 w-16 rounded-full bg-blue-500 hover:bg-blue-600"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </motion.div>

        <AnimatePresence>
          {isRecording && (
            [...Array(3)].map((_,i) => (
              <motion.div
                key={i}
                variants={pulseVariants}
                animate="recording"
                className="absolute inset-0 rounded-full border-2 border-red-500"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onStopRecording}
          disabled={!isRecording}
          size="lg"
          variant="destructive"
          className="gap-2"
        >
          <Square className="h-5 w-5" />
          Stop
        </Button>

        <Button
          onClick={onSendRecording}
          disabled={isRecording}
          size="lg"
          variant="outline"
          className="gap-2"
        >
          <Send className="h-5 w-5" />
          Send Answer
        </Button>
      </div>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-red-500"
          >
            Recording in progress...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
