"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Mic } from "lucide-react"

interface TranscriptDisplayProps {
  transcript: string[]
  interimTranscript: string
  isRecording: boolean
}

export function TranscriptDisplay({ transcript, interimTranscript, isRecording }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript, interimTranscript])

  const transcriptVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.9,
      transition: { duration: 0.3 },
    },
  }

  const interimVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <Card className="shadow-lg border-0 h-96">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
            <motion.div
              animate={{ rotate: isRecording ? 360 : 0 }}
              transition={{ duration: 2, repeat: isRecording ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
            >
              <FileText className="mr-2 w-5 h-5 text-blue-600" />
            </motion.div>
            Live Transcript
          </CardTitle>
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Badge className="bg-red-100 text-red-700">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Mic className="mr-1 w-3 h-3" />
                  </motion.div>
                  Recording
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        >
          <AnimatePresence>
            {transcript.length === 0 && !interimTranscript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full text-slate-400"
              >
                <div className="text-center space-y-2">
                  <motion.div
                    animate={{
                      y: [-5, 5, -5],
                      rotate: [-10, 10, -10],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Mic className="w-8 h-8 mx-auto opacity-50" />
                  </motion.div>
                  <p className="text-sm">Start speaking to see your transcript here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {transcript.map((text, index) => (
              <motion.div
                key={index}
                variants={transcriptVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-slate-50 p-3 rounded-lg"
              >
                <p className="text-slate-800 leading-relaxed">{text}</p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 pt-2 border-t border-slate-200"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Response {index + 1}</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      Processed
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {interimTranscript && (
              <motion.div
                variants={interimVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600"
              >
                <motion.p
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="text-slate-700 leading-relaxed italic"
                >
                  {interimTranscript}
                </motion.p>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex items-center justify-between text-xs text-blue-600">
                    <span>Live transcription</span>
                    <div className="flex space-x-1">
                      {[0, 0.1, 0.2].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [-2, -6, -2],
                            backgroundColor: ["#2563eb", "#3b82f6", "#2563eb"],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay,
                            ease: "easeInOut",
                          }}
                          className="w-1 h-1 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
