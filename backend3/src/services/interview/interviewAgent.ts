import { EventEmitter } from "events"
import * as fs from "fs"
import * as path from "path"
import { v4 as uuidv4 } from "uuid"
import { config } from "dotenv"
import { ChatGroq } from "@langchain/groq"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

interface ConversationMessage {
  role: "interviewer" | "candidate"
  content: string
  timestamp: Date
}

interface InterviewSession {
  tech_stack: string
  position: string
  question_count: number
  difficulty: "beginner" | "intermediate" | "advanced"
  conversation_history: ConversationMessage[]
  is_complete: boolean
  ended_early: boolean
}

function loadEnvironment(): boolean {
  try {
    config()

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
    if (!apiKey) {
      console.log("❌ API key not found in environment")
      console.log("Please add GROQ_API_KEY, OPENAI_API_KEY, or LLM_API_KEY to your .env file")
      return false
    }

    console.log("✓ Environment variables loaded")
    return true
  } catch (error) {
    console.log(`❌ Error loading environment: ${error}`)
    return false
  }
}

export class InterviewAgent extends EventEmitter {
  private sessions: { [sessionId: string]: InterviewSession } = {}
  private readonly maxQuestions: number = 5
  private readonly llm: ChatGroq

  constructor() {
    super()

    console.log("🔄 Initializing InterviewAgent...")

    try {
      // Load environment variables
      if (!loadEnvironment()) {
        throw new Error("Failed to load environment variables")
      }

      this.llm = new ChatGroq({
        model: "moonshotai/kimi-k2-instruct",
        temperature: 0.3,
        maxRetries: 2,
      })

      console.log("✓ LLM initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing InterviewAgent:", error)
      throw error
    }
  }

  /**
   * Start a new interview session
   */
  startInterview(techStack = "Python, JavaScript, React", position = "Software Developer",  externalSessionId?: string): [string | null, string] {
    try {
      console.log("Starting interview with:", { techStack, position })

      // Ensure techStack is a string
      const techStackStr = typeof techStack === "string" ? techStack : String(techStack)

    const sessionId = externalSessionId || uuidv4().substring(0, 8)

      this.sessions[sessionId] = {
        tech_stack: techStackStr,
        position: position,
        question_count: 0,
        difficulty: "beginner",
        conversation_history: [],
        is_complete: false,
        ended_early: false,
      }

      const firstTech = techStackStr.split(",")[0]?.trim() || techStackStr
      const initialMessage = `Hello! I'm Prep Piper, your AI interviewer for today's ${position} interview.

I see your tech stack includes: ${techStackStr}

Let's start with something fundamental. Can you explain what ${firstTech} is and describe one project where you've used it effectively?`

      this.sessions[sessionId].conversation_history.push({
        role: "interviewer",
        content: initialMessage,
        timestamp: new Date(),
      })

      this.emit("sessionStarted", { sessionId, initialMessage })
      return [sessionId, initialMessage]
    } catch (error) {
      console.error(`❌ Error starting interview: ${error}`)
      return [null, `Error: ${error}`]
    }
  }

  /**
   * Process candidate answer and generate next question
   */
  async processAnswer(sessionId: string, answer: string): Promise<string> {
    try {
      if (!(sessionId in this.sessions)) {
        this.emit("error", { sessionId, error: "Session not found" })
        return "❌ Session not found! Please start a new interview."
      }

      const session: InterviewSession = this.sessions[sessionId]!

      if (session?.is_complete) {
        const completionMessage = this.generateCompletionMessage(sessionId)
        this.emit("interviewComplete", {
          sessionId,
          message: completionMessage,
          totalQuestions: session.question_count,
          techStack: session.tech_stack,
          position: session.position,
        })
        return completionMessage
      }

      // Validate answer
      if (!answer || answer.trim().length < 3) {
        const shortAnswerMessage =
          "🤔 I'd like to hear more from you. Please share your thoughts or ask for clarification if needed."
        this.emit("shortAnswer", { sessionId, message: shortAnswerMessage })
        return shortAnswerMessage
      }

      // Add candidate's answer to history
      session?.conversation_history.push({
        role: "candidate",
        content: answer,
        timestamp: new Date(),
      })

      // Increment question count
      session.question_count += 1

      // Check if interview should end
      if (session?.question_count >= this.maxQuestions) {
        session.is_complete = true
        const completionMessage = this.generateCompletionMessage(sessionId)

        this.emit("interviewComplete", {
          sessionId,
          message: completionMessage,
          totalQuestions: session.question_count,
          techStack: session.tech_stack,
          position: session.position,
        })

        return completionMessage
      }

      // Generate next question
      const nextQuestion = await this.generateNextQuestion(sessionId)

      session?.conversation_history.push({
        role: "interviewer",
        content: nextQuestion,
        timestamp: new Date(),
      })

      this.emit("nextQuestion", {
        sessionId,
        question: nextQuestion,
        questionNumber: session.question_count + 1,
        totalQuestions: this.maxQuestions,
      })

      return nextQuestion
    } catch (error) {
      console.error(`❌ Error processing answer: ${error}`)
      const errorMessage = `Error processing your answer: ${error}`
      this.emit("error", { sessionId, error: errorMessage })
      return errorMessage
    }
  }

/**
   * UPDATE: Enhanced end interview early with contextual messages
   */
  endInterviewEarly(sessionId: string): string {
    if (!(sessionId in this.sessions)) {
      return "❌ Session not found!"
    }

    const session = this.sessions[sessionId]!
    session.is_complete = true
    session.ended_early = true

    // UPDATE: Generate contextual early termination message based on progress
    const message = this.generateEarlyTerminationMessage(sessionId)
    
    session.conversation_history.push({
      role: "interviewer",
      content: message,
      timestamp: new Date(),
    })

    // UPDATE: Emit early termination event
    this.emit("earlyTermination", {
      sessionId,
      message,
      totalQuestions: session.question_count,
      techStack: session.tech_stack,
      position: session.position,
      endedEarly: true,
    })

    console.log(`🛑 Interview ${sessionId} ended early - ${session.question_count}/${this.maxQuestions} questions completed`)
    return message
  }

  /**
   * UPDATE: Generate contextual early termination messages
   */
  private generateEarlyTerminationMessage(sessionId: string): string {
    const session = this.sessions[sessionId]!
    
    // Generate contextual message based on interview progress
    if (session.question_count === 0) {
      return `I understand you need to end the interview before we could get started. Thank you for your time, and best of luck with your ${session.position} role search!`
    } else if (session.question_count === 1) {
      return `Thank you for the initial question we covered about ${session.tech_stack}. While we only got through one question, I appreciate the time you spent with me. Best wishes for your ${session.position} career journey!`
    } else if (session.question_count < this.maxQuestions / 2) {
      return `Thank you for the ${session.question_count} questions we covered regarding ${session.tech_stack}. While we didn't complete the full interview, I got some good insights into your technical background. I appreciate your time and wish you success in your ${session.position} role search!`
    } else {
      return `We made good progress covering ${session.question_count} out of ${this.maxQuestions} questions about ${session.tech_stack}. This gave me valuable insight into your technical expertise and problem-solving approach. Thank you for your time, and I wish you continued success in your ${session.position} career journey!`
    }
  }


  private async generateNextQuestion(sessionId: string): Promise<string> {
    try {
      const session: InterviewSession | undefined = this.sessions[sessionId]

      if (!session) {
        this.emit("error", { sessionId, error: "Session not found" })
        return "❌ Session not found! Please start a new interview."
      }

      // Create conversation context
      const recentConversation = session.conversation_history
        .slice(-4)
        .map((msg) => `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`)
        .join("\n\n")

      // Create system prompt
      const systemContent = `You are a technical interviewer for a ${session.position} role.

INTERVIEW CONTEXT:
- Tech Stack: ${session.tech_stack}
- Question Number: ${session.question_count + 1} of ${this.maxQuestions}
- Current Level: ${session.difficulty}

RECENT CONVERSATION:
${recentConversation}

Your role as an interviewer: 
1. Ask ONE question at a time and wait for candidates response
2. Start with basics—especially covering the tech stacks the candidate selected.
3. Ask follow-up questions based on candidates previous response
4. Probe deeper when answers are incomplete or need more clarification
5. Cover both theoretical knowledge and practical implementation
6. Ask about real world problem scenarios and their probable solutions
7. Be encouraging through your questioning
8. Keep track of covered topics and explore uncovered topics
10. FIRST FEW QUESTIONS MUST DIRECTLY ADDRESS EACH TECHNOLOGY IN ${session.tech_stack}.

TASK: Generate only the next interview question, nothing else. Adapt it based on:
- The candidate’s last answer
- Their demonstrated skill level
- The remaining tech stack focus areas
- The conversation so far

GUIDELINES:
- One clear, concise question (voice interview style).
- No multi-part or written coding questions.
- Adapt questions based on demonstrated knowledge level
- When candidate says "I don't know", offer hints or redirect to related simpler topics
- Keep questions focused and specific
- Maintain an empathetic, professional, and encouraging tone
- Always reference their previous response to show you're listening



EXAMPLES:

---
Example 1:
CONTEXT:
Tech Stack: React, TypeScript
Question 1 of 5
Previous Response: N/A

GENERATED QUESTION:
“Can you explain the concept of a React hook and tell me which hook you use most often in a TypeScript project?”

---
Example 2:
CONTEXT:
Tech Stack: React, TypeScript
Question 2 of 5
Previous Response: “I use useState and useEffect, but sometimes struggle with useCallback.”

GENERATED QUESTION:
“You mentioned useCallback can be tricky—how would you use useCallback in TypeScript to optimize rendering of a list component? Give a brief example of its use.”

---
Example 3:
CONTEXT:
Tech Stack: Node.js, Express
Question 1 of 5
Previous Response: N/A

GENERATED QUESTION:
“Can you describe how middleware works in Express.js and share a use case where custom middleware is beneficial?”

---
Example 4:
CONTEXT:
Tech Stack: Node.js, Express
Question 2 of 5
Previous Response: “I’ve written logging middleware but not custom error handlers.”

GENERATED QUESTION:
“You mentioned logging middleware—how would you implement a global error-handling middleware in Express, and what status codes would you return for different error types?”

---
Example 5:
CONTEXT:
Tech Stack: Python, Django
Question 1 of 5
Previous Response: N/A

GENERATED QUESTION:
“Could you explain Django’s ORM and how you would define a one-to-many relationship between two models?”

---
Example 6:
CONTEXT:
Tech Stack: Python, Django
Question 2 of 5
Previous Response: “I’ve used models but haven’t worked with QuerySets deeply.”

GENERATED QUESTION:
“When using QuerySets in Django, how would you efficiently filter and paginate results for a large dataset? Please outline your approach.”

---
Example 7:
CONTEXT:
Tech Stack: React Native, Redux
Question 1 of 5
Previous Response: N/A

GENERATED QUESTION:
“Can you explain how Redux integrates with React Native and describe the steps to set up a simple global state store?”

---
Example 8:
CONTEXT:
Tech Stack: React Native, Redux
Question 2 of 5
Previous Response: “I understand actions and reducers but haven’t used middleware much.”

GENERATED QUESTION:
“How would you use Redux Thunk or Saga in React Native to handle asynchronous actions like fetching data from an API?”

---
Example 9:
CONTEXT:
Tech Stack: Go, Fiber
Question 1 of 5
Previous Response: N/A

GENERATED QUESTION:
“Describe Fiber’s routing mechanism in Go and how you would structure routes for a RESTful API.”

---
Example 10:
CONTEXT:
Tech Stack: Go, Fiber
Previous Response: “I’ve defined routes but not organized versioning.”

GENERATED QUESTION:
“How would you implement API versioning in Fiber, and what strategies ensure backward compatibility?”

---
These examples demonstrate how to tailor the next question based on the tech stack, previous response, and candidate’s demonstrated skill level.

Current interview session: Focus on ${session.tech_stack} technologies
Interview Style: Voice Interview, Professional, empathetic, encouraging and thorough 

Remember: You are evaluating technical competency, problem solving skills and in depth understanding of chosen tech stack.

Generate only the next question, nothing else.`

      const messages = [new SystemMessage(systemContent), new HumanMessage("Generate the next interview question.")]

      const response = await this.llm.invoke(messages)
      let content: string

      if (typeof response.content === "string") {
        content = response.content
      } else if (Array.isArray(response.content)) {
        content = response.content
          .map((item) => {
            if (typeof item === "string") return item
            //@ts-ignore
            if ("text" in item) return item.text
            return ""
          })
          .join("")
          .trim()
      } else {
        content = ""
      }

      return content || "Could you tell me more about your experience with the technologies we discussed?"
    } catch (error) {
      console.error(`❌ Error generating question: ${error}`)
      return "I'm having trouble generating the next question. Could you tell me more about your experience with the technologies we discussed?"
    }
  }

  private generateCompletionMessage(sessionId: string): string {
    const session: InterviewSession = this.sessions[sessionId]!
    return `🏁 **Interview Complete!**

Thank you for participating in this ${session.position} interview!

📊 **Session Summary:**
- Questions Answered: ${session.question_count}/${this.maxQuestions}
- Tech Stack Covered: ${session.tech_stack}
- Final Difficulty: ${session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}

Type 'summary' for detailed conversation history.`
  }

  /**
   * Get detailed session summary
   */
  getSummary(sessionId: string): string {
    if (!(sessionId in this.sessions)) {
      return "❌ Session not found!"
    }

    const session: InterviewSession = this.sessions[sessionId]!

    let summary = `
📊 **DETAILED INTERVIEW SUMMARY**
═══════════════════════════════════════════════════════════════════

🆔 Session ID: ${sessionId}
📋 Position: ${session.position}
🛠️ Tech Stack: ${session.tech_stack}
❓ Questions: ${session.question_count}/${this.maxQuestions}
📈 Difficulty: ${session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
✅ Status: ${session.is_complete ? "Complete" : "In Progress"}
⚠️ Early Termination: ${session.ended_early ? "Yes" : "No"}

📝 **FULL CONVERSATION:**
`

    session.conversation_history.forEach((msg, index) => {
      const roleEmoji = msg.role === "interviewer" ? "🎤" : "👤"
      summary += `\n${index + 1}. ${roleEmoji} ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:\n${msg.content}\n${"-".repeat(40)}\n`
    })

    return summary
  }

  /**
   * Save session to file
   */
  async saveSession(sessionId: string): Promise<void> {
    try {
      const interviewsDir = path.join(process.cwd(), "interviews")

      // Create directory if it doesn't exist
      if (!fs.existsSync(interviewsDir)) {
        fs.mkdirSync(interviewsDir, { recursive: true })
      } 

      const filename = path.join(interviewsDir, `${sessionId}.json`)
      const sessionData = JSON.stringify(this.sessions[sessionId], null, 2)

      fs.writeFileSync(filename, sessionData)
      this.emit("sessionSaved", { sessionId })

      console.log(`✅ Session saved to ${filename}`)
    } catch (error) {
      console.error(`❌ Save error: ${error}`)
    }
  }
}
