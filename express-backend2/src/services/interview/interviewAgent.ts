import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

interface ConversationMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

interface InterviewSession {
  tech_stack: string;
  position: string;
  question_count: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  conversation_history: ConversationMessage[];
  is_complete: boolean;
}

function loadEnvironment(): boolean {
  try {
    config();
    
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      console.log("❌ API key not found in environment");
      console.log("Please add GROQ_API_KEY, OPENAI_API_KEY, or LLM_API_KEY to your .env file");
      return false;
    }
    
    console.log("✓ Environment variables loaded");
    return true;
  } catch (error) {
    console.log(`❌ Error loading environment: ${error}`);
    return false;
  }
}

export class InterviewAgent extends EventEmitter {
  private sessions: { [sessionId: string]: InterviewSession } = {};
  private readonly maxQuestions: number = 5;
  private readonly llm: ChatGroq;

  constructor() {
    super();
    
    console.log("🔄 Initializing InterviewAgent...");
    
    try {
      // Load environment variables
      if (!loadEnvironment()) {
        throw new Error("Failed to load environment variables");
      }

      this.llm = new ChatGroq({
        model: "moonshotai/kimi-k2-instruct",
        temperature: 0.3,
        maxRetries: 2
      });
      
      console.log("✓ LLM initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing InterviewAgent:", error);
      throw error;
    }
  }

  /**
   * Start a new interview session
   */
  startInterview(techStack = "Python, JavaScript, React", position = "Software Developer"): [string | null, string] {
    try {
      console.log('Starting interview with:', { techStack, position });
      
      // Ensure techStack is a string
      const techStackStr = typeof techStack === 'string' ? techStack : String(techStack);
      
      const sessionId = uuidv4().substring(0, 8);
      
      this.sessions[sessionId] = {
        tech_stack: techStackStr,
        position: position,
        question_count: 0,
        difficulty: 'beginner',
        conversation_history: [],
        is_complete: false
      };
      
      const firstTech = techStackStr.split(',')[0]?.trim() || techStackStr;
      const initialMessage = `Hello! I'm Prep Piper, your AI interviewer for today's ${position} interview.

I see your tech stack includes: ${techStackStr}

Let's start with something fundamental. Can you explain what ${firstTech} is and describe one project where you've used it effectively?`;

      this.sessions[sessionId].conversation_history.push({
        role: 'interviewer',
        content: initialMessage,
        timestamp: new Date()
      });

      this.emit('sessionStarted', { sessionId, initialMessage });
      return [sessionId, initialMessage];
    } catch (error) {
      console.error(`❌ Error starting interview: ${error}`);
      return [null, `Error: ${error}`];
    }
  }

  /**
   * Process candidate answer and generate next question
   */
  async processAnswer(sessionId: string, answer: string): Promise<string> {
    try {
      if (!(sessionId in this.sessions)) {
        this.emit('error', { sessionId, error: 'Session not found' });
        return "❌ Session not found! Please start a new interview.";
      }

      const session: InterviewSession = this.sessions[sessionId]!;

      if (session?.is_complete) {
        const completionMessage = this.generateCompletionMessage(sessionId);
        this.emit('interviewComplete', { 
          sessionId, 
          message: completionMessage,
          totalQuestions: session.question_count,
          techStack: session.tech_stack,
          position: session.position
        });
        return completionMessage;
      }

      // Validate answer
      if (!answer || answer.trim().length < 3) {
        const shortAnswerMessage = "🤔 I'd like to hear more from you. Please share your thoughts or ask for clarification if needed.";
        this.emit('shortAnswer', { sessionId, message: shortAnswerMessage });
        return shortAnswerMessage;
      }

      // Add candidate's answer to history
      session?.conversation_history.push({
        role: 'candidate',
        content: answer,
        timestamp: new Date()
      });

      // Increment question count
      session.question_count += 1;

      // Check if interview should end
      if (session?.question_count >= this.maxQuestions) {
        session.is_complete = true;
        const completionMessage = this.generateCompletionMessage(sessionId);

        this.emit('interviewComplete', { 
          sessionId, 
          message: completionMessage,
          totalQuestions: session.question_count,
          techStack: session.tech_stack,
          position: session.position
        });

        return completionMessage;
      }

      // Generate next question
      const nextQuestion = await this.generateNextQuestion(sessionId);

      session?.conversation_history.push({
        role: 'interviewer',
        content: nextQuestion,
        timestamp: new Date()
      });

      this.emit('nextQuestion', { 
        sessionId, 
        question: nextQuestion,
        questionNumber: session.question_count + 1,
        totalQuestions: this.maxQuestions
      });

      return nextQuestion;

    } catch (error) {
      console.error(`❌ Error processing answer: ${error}`);
      const errorMessage = `Error processing your answer: ${error}`;
      this.emit('error', { sessionId, error: errorMessage });
      return errorMessage;
    }
  }

  private async generateNextQuestion(sessionId: string): Promise<string> {
    try {
      const session: InterviewSession | undefined = this.sessions[sessionId];

      if (!session) {
        this.emit('error', { sessionId, error: 'Session not found' });
        return "❌ Session not found! Please start a new interview.";
      }

      // Create conversation context
      const recentConversation = session.conversation_history
        .slice(-4)
        .map(msg => `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`)
        .join('\n\n');

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
2. Start with Basics and gradually increase difficulty
3. Ask follow-up questions based on candidates previous response
4. Probe deeper when answers are incomplete or need more clarification
5. Cover both theoretical knowledge and practical implementation
6. Ask about real world problem scenarios and their probable solutions
7. Be encouraging through your questioning
8. Keep track of covered topics and explore uncovered topics

TASK: Generate the next interview question based on:
1. The candidate's previous response
2. Their demonstrated skill level
3. The tech stack focus areas

GUIDELINES:
- Ask ONE clear, specific question
- Adapt questions based on demonstrated knowledge level
- When candidate says "I don't know", offer hints or redirect to related simpler topics
- Keep questions focused and specific
- Maintain an empathetic, professional, and encouraging tone
- Always reference their previous response to show you're listening

Current interview session: Focus on ${session.tech_stack} technologies
Interview Style: Professional, empathetic, encouraging and thorough 

Remember: You are evaluating technical competency, problem solving skills and in depth understanding of chosen tech stack.

Generate only the next question, nothing else.`;

      const messages = [
        new SystemMessage(systemContent),
        new HumanMessage('Generate the next interview question.')
      ];

      const response = await this.llm.invoke(messages);
      let content: string;
      
      if (typeof response.content === 'string') {
        content = response.content;
      } else if (Array.isArray(response.content)) {
        content = response.content
          .map(item => {
            if (typeof item === 'string') return item;
            //@ts-ignore
            if ('text' in item) return item.text;
            return '';
          }) 
          .join('')
          .trim();
      } else {
        content = '';
      }

      return content || "Could you tell me more about your experience with the technologies we discussed?";

    } catch (error) {
      console.error(`❌ Error generating question: ${error}`);
      return "I'm having trouble generating the next question. Could you tell me more about your experience with the technologies we discussed?";
    }
  }

  private generateCompletionMessage(sessionId: string): string {
    const session: InterviewSession = this.sessions[sessionId]!;
    return `🏁 **Interview Complete!**

Thank you for participating in this ${session.position} interview!

📊 **Session Summary:**
- Questions Answered: ${session.question_count}/${this.maxQuestions}
- Tech Stack Covered: ${session.tech_stack}
- Final Difficulty: ${session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}

Type 'summary' for detailed conversation history.`;
  }

  /**
   * Get detailed session summary
   */
  getSummary(sessionId: string): string {
    if (!(sessionId in this.sessions)) {
      return "❌ Session not found!";
    }

    const session: InterviewSession = this.sessions[sessionId]!;

    let summary = `
📊 **DETAILED INTERVIEW SUMMARY**
═══════════════════════════════════════════════════════════════════

🆔 Session ID: ${sessionId}
📋 Position: ${session.position}
🛠️ Tech Stack: ${session.tech_stack}
❓ Questions: ${session.question_count}/${this.maxQuestions}
📈 Difficulty: ${session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
✅ Status: ${session.is_complete ? 'Complete' : 'In Progress'}

📝 **FULL CONVERSATION:**
`;

    session.conversation_history.forEach((msg, index) => {
      const roleEmoji = msg.role === 'interviewer' ? '🎤' : '👤';
      summary += `\n${index + 1}. ${roleEmoji} ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:\n${msg.content}\n${'-'.repeat(40)}\n`;
    });

    return summary;
  }

  /**
   * Save session to file
   */
  async saveSession(sessionId: string): Promise<void> {
    try {
      const interviewsDir = path.join(process.cwd(), 'interviews');

      // Create directory if it doesn't exist
      if (!fs.existsSync(interviewsDir)) {
        fs.mkdirSync(interviewsDir, { recursive: true });
      }

      const filename = path.join(interviewsDir, `${sessionId}.json`);
      const sessionData = JSON.stringify(this.sessions[sessionId], null, 2);

      fs.writeFileSync(filename, sessionData);
      this.emit('sessionSaved', { sessionId });

      console.log(`✅ Session saved to ${filename}`);
    } catch (error) {
      console.error(`❌ Save error: ${error}`);
    }
  }
}
