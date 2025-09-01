"use client"

import { Button } from "@/components/ui/button"
import { Mic, Square, MicOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceControlsProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  disabled?: boolean
}

export function VoiceControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled
}: VoiceControlsProps) {
  
  const micButtonVariants = {
    idle: {
      scale: 1,
      boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
    },
    recording: {
      scale: [1, 1.1, 1],
      boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
      transition: {
        scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
        boxShadow: { duration: 0.3 },
      },
    },
    disabled: {
      scale: 1,
      boxShadow: "0 2px 10px rgba(148, 163, 184, 0.2)",
    },
  }

  const pulseVariants = {
    recording: {
      scale: [1, 2, 3],
      opacity: [0.7, 0.3, 0],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <motion.div
          variants={micButtonVariants}
          animate={disabled ? "disabled" : isRecording ? "recording" : "idle"}
          className="relative"
        >
          <Button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className={`relative h-16 w-16 rounded-full ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {disabled ? (
              <MicOff className="h-6 w-6" />
            ) : isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </motion.div>

        {/* Pulse animation when recording */}
        <AnimatePresence>
          {isRecording && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={pulseVariants}
                  animate="recording"
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {disabled 
            ? "Recording unavailable"
            : isRecording 
              ? "Recording..." 
              : "Click to record"
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {disabled
            ? "Check connection"
            : isRecording
              ? "Click square to stop"
              : "Press and hold microphone button"
          }
        </p>
      </div>

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-red-500"
          >
            <div className="flex gap-1">
              {[0, 0.1, 0.2].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [1, 2, 1],
                    transition: {
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: delay,
                    },
                  }}
                  className="w-1 h-3 bg-red-500 rounded"
                />
              ))}
            </div>
            <span>Recording in progress</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
