import { type NextRequest, NextResponse } from "next/server"
import type { InterviewSession } from "@/lib/types"

// Mock database - replace with actual database integration
const sessions: Map<string, InterviewSession> = new Map()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session: InterviewSession = {
      id: sessionId,
      userId,
      status: "idle",
      currentQuestionIndex: 0,
      totalQuestions: 5,
      startedAt: new Date(),
      progress: 0,
    }

    sessions.set(sessionId, session)

    return NextResponse.json({
      success: true,
      data: session,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 })
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: session,
  })
}
