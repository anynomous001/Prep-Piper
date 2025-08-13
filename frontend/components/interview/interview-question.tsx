"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Volume2 } from "lucide-react"

interface InterviewQuestionProps {
  question: string
  questionNumber: number
  totalQuestions: number
}

export function InterviewQuestion({ question, questionNumber, totalQuestions }: InterviewQuestionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [question])

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  }

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question}
        variants={cardVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        exit="exit"
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="pb-4">
            <motion.div variants={contentVariants} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                    scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
                  }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center"
                >
                  <Brain className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">AI Interview Question</h2>
                  <p className="text-sm text-slate-600">Listen carefully and respond when ready</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Badge className="bg-blue-100 text-blue-700">
                  {questionNumber} of {totalQuestions}
                </Badge>
              </motion.div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={contentVariants}
              className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl border-l-4 border-blue-600"
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Volume2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg text-slate-800 leading-relaxed font-medium"
                >
                  {question || "Preparing your next question..."}
                </motion.p>
              </div>
            </motion.div>

            {question && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500"
              >
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> Take a moment to structure your response. Consider using specific examples and
                  quantifiable results.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
