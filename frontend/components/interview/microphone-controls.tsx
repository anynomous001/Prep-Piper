"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square } from "lucide-react"
interface MicrophoneControlsProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  interviewState: "idle" | "connecting" | "active" | "processing" | "waiting_for_next" | "completed"
}

export function MicrophoneControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  interviewState,
}: MicrophoneControlsProps) {
  const canRecord = interviewState === "active" || interviewState === "waiting_for_next"

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
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
          <motion.div
            animate={{ rotate: isRecording ? 360 : 0 }}
            transition={{ duration: 2, repeat: isRecording ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          >
            <Mic className="mr-2 w-5 h-5 text-blue-600" />
          </motion.div>
          Your Response
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="relative flex flex-col items-center space-y-4">
            {!isRecording ? (
              <motion.div
                variants={micButtonVariants}
                animate={canRecord ? "idle" : "disabled"}
                whileHover={canRecord ? { scale: 1.05 } : {}}
                whileTap={canRecord ? { scale: 0.95 } : {}}
              >
                <Button
                  onClick={onStartRecording}
                  disabled={!canRecord}
                  size="lg"
                  className={`w-20 h-20 rounded-full transition-all duration-300 ${
                    canRecord
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-300 cursor-not-allowed"
                  } text-white relative overflow-hidden`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="mic"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mic className="w-8 h-8" />
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={micButtonVariants}
                animate="recording"
                className="relative"
              >
                <Button
                  onClick={onStopRecording}
                  size="lg"
                  className="w-20 h-20 rounded-full transition-all duration-300 bg-red-600 hover:bg-red-700 text-white relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="stop"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Square className="w-8 h-8" />
                    </motion.div>
                  </AnimatePresence>
                </Button>

                <AnimatePresence>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-4 border-red-300"
                      variants={pulseVariants}
                      animate="recording"
                      style={{ animationDelay: `${i * 0.5}s` }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-red-600 font-semibold">Recording in progress</span>
                <Button
                  onClick={onStopRecording}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Stop & Send
                </Button>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <motion.p
              animate={{
                color: isRecording ? "#dc2626" : "#1e293b",
              }}
              className="text-lg font-semibold"
            >
              {isRecording ? "Recording your response..." : "Click to start recording"}
            </motion.p>
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-sm text-slate-600"
            >
              {isRecording
                ? "Speak clearly and click stop when finished"
                : canRecord
                  ? "Press and hold to record your answer"
                  : interviewState === "processing"
                    ? "Processing your response..."
                    : "Waiting for next question..."}
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex justify-center space-x-2 mt-4"
              >
                {[0, 0.1, 0.2].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-4, -12, -4],
                      backgroundColor: ["#dc2626", "#ef4444", "#dc2626"],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                      delay,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
