// components/interview/interview-question.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock } from "lucide-react"
import { InterviewState } from "@/lib/types"

interface InterviewQuestionProps {
  question: string
  questionIdx: number
  totalQuestions: number
  interviewState: InterviewState
}

export function InterviewQuestion({ question, questionIdx, totalQuestions, interviewState }: InterviewQuestionProps) {
  const getStateColor = () => {
    switch (interviewState) {
      case "active": return "bg-teal-500"
      case "processing": return "bg-yellow-500"
      case "completed": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStateText = () => {
    switch (interviewState) {
      case "active": return "Active"
      case "processing": return "Processing"
      case "completed": return "Completed"
      default: return "Waiting"
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            Current Question
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
              {questionIdx}/{totalQuestions}
            </Badge>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStateColor()}`} />
              <span className="text-xs text-gray-400">{getStateText()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-white text-lg leading-relaxed">
            {question || (
              <span className="text-gray-400 italic flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Waiting for question...
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
