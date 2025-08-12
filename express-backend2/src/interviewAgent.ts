/**
 * A simplified and robust technical interview agent with enhanced error handling.
 * Converted from Python to TypeScript
 * 

 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import * as readline from 'readline';
import  {ChatGroq}  from "@langchain/groq";
import { HumanMessage,SystemMessage } from "@langchain/core/messages";




interface ConversationMessage {
  role: 'interviewer' | 'candidate';
  content: string;
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

class TechInterviewer {
  private sessions: { [sessionId: string]: InterviewSession } = {};
  private readonly maxQuestions: number = 5;
  private readonly llm: ChatGroq;
  
  constructor() {
    try {
      this.llm = new ChatGroq({
                model:"moonshotai/kimi-k2-instruct",
                temperature:0.3,
                maxRetries:2
     });
            console.log("✓ LLM initialized successfully");
    } catch (error) {
      console.log(`❌ Error initializing LLM: ${error}`);
      throw error;
    }
  }
  
  /**
   * Start a new interview session
   */
  startInterview(techStack = "Python, JavaScript, React", position = "Software Developer"): [string | null, string] {
    try {
      const sessionId = uuidv4().substring(0, 8);
      
      this.sessions[sessionId] = {
        tech_stack: techStack,
        position: position,
        question_count: 0,
        difficulty: 'beginner',
        conversation_history: [],
        is_complete: false
      };
      
      const firstTech = techStack.split(',')[0]?.trim() || techStack;
      const initialMessage = `Hello! I'm Prep Piper, your AI interviewer for today's ${position} interview.

I see your tech stack includes: ${techStack}

Let's start with something fundamental. Can you explain what ${firstTech} is and describe one project where you've used it effectively?`;

      this.sessions[sessionId].conversation_history.push({
        role: 'interviewer',
        content: initialMessage
      });
      
      return [sessionId, initialMessage];
      
    } catch (error) {
      console.log(`❌ Error starting interview: ${error}`);
      return [null, `Error: ${error}`];
    }
  }
  
  /**
   * Process candidate answer and generate next question
   */
  async processAnswer(sessionId: string, answer: string): Promise<string> {
    try {
      if (!(sessionId in this.sessions)) {
        return "❌ Session not found! Please start a new interview.";
      }
      
      const session: InterviewSession = this.sessions[sessionId]!;
      
      if (session?.is_complete) {
        return "✅ Interview already completed! Type 'summary' for recap.";
      }
      
      // Validate answer
      if (!answer || answer.trim().length < 3) {
        return "🤔 I'd like to hear more from you. Please share your thoughts or ask for clarification if needed.";
      }
      
      // Add candidate's answer to history
      session?.conversation_history.push({
        role: 'candidate',
        content: answer
      });
      
      // Increment question count
      session.question_count += 1;
      
      // Check if interview should end
      if (session?.question_count >= this.maxQuestions) {
        session.is_complete = true;
        return this.generateCompletionMessage(sessionId);
      }
      
      // Generate next question
      const nextQuestion = await this.generateNextQuestion(sessionId);
      
      session?.conversation_history.push({
        role: 'interviewer',
        content: nextQuestion
      });
      
      return nextQuestion;
      
    } catch (error) {
      console.log(`❌ Error processing answer: ${error}`);
      return `Error processing your answer: ${error}`;
    }
  }
  
 
  private async generateNextQuestion(sessionId: string): Promise<string> {
    try {
      const session: InterviewSession | undefined = this.sessions[sessionId];
      
      if (!session) {
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
          // Extract text from MessageContentComplex array
          content = response.content
          //ts-ignore
          .map(item => {
            if (typeof item === 'string') return item
            if ('text' in item) return item.text;
            return '';
        })              
        .join('')
        .trim();
      } else {
          content = '';
      }
      
      return content  || "Could you tell me more about your experience with the technologies we discussed?";
      
    } catch (error) {
      console.log(`❌ Error generating question: ${error}`);
      return "I'm having trouble generating the next question. Could you tell me more about your experience with the technologies we discussed?";
    }
  }
  

  private  generateCompletionMessage(sessionId: string): string {
    const session:InterviewSession = this.sessions[sessionId]!;
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
    
    const session:InterviewSession = this.sessions[sessionId]!;
    
    let summary = `
📊 **DETAILED INTERVIEW SUMMARY**
═══════════════════════════════════════════════════════════════════

🆔 Session ID: ${sessionId}
📋 Position: ${session.position}
🛠️  Tech Stack: ${session.tech_stack}
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
      console.log(`✅ Session saved to ${filename}`);
    } catch (error) {
      console.log(`❌ Save error: ${error}`);
    }
  }
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Async wrapper for readline question
 */
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Main function with comprehensive error handling
 */
async function main(): Promise<void> {
  try {
    console.log("🚀 Starting Prep Piper Interview Agent...");
    console.log("=".repeat(60));
    
   
    
    // Load environment
    console.log("\n🔧 Loading environment...");
    if (!loadEnvironment()) {
      console.log("\n❌ Please check your .env file and try again.");
      return;
    }
    
    // Initialize interviewer
    console.log("\n🤖 Initializing interviewer...");
    const interviewer = new TechInterviewer();
    
    console.log("\n🎯 Welcome to Prep Piper - Technical Interview Simulator!");
    console.log("This AI conducts structured technical interviews based on your tech stack.\n");
    
    const rl = createReadlineInterface();
    
    try {
      // Get interview setup
      console.log("📝 Interview Setup:");
      let techStack = await askQuestion(rl, "Enter your tech stack (comma-separated, or press Enter for default): ");
      techStack = techStack.trim();
      if (!techStack) {
        techStack = "Python, JavaScript, React";
        console.log(`Using default: ${techStack}`);
      }
      
      let position = await askQuestion(rl, "Enter position (default: Software Developer): ");
      position = position.trim();
      if (!position) {
        position = "Software Developer";
      }
      
      // Start interview
      console.log("\n🎬 Starting interview...");
      const [sessionId, initialMessage] = interviewer.startInterview(techStack, position);
      
      if (!sessionId) {
        console.log(`❌ Failed to start interview: ${initialMessage}`);
        return;
      }
      
      console.log("=".repeat(80));
      console.log(`🎯 TECHNICAL INTERVIEW STARTED`);
      console.log(`📋 Position: ${position}`);
      console.log(`🛠️  Tech Stack: ${techStack}`);
      console.log(`🆔 Session ID: ${sessionId}`);
      console.log("=".repeat(80));
      console.log(`\n🎤 Interviewer: ${initialMessage}`);
      
      console.log("\n💡 Commands: 'exit', 'summary', 'save'");
      console.log("-".repeat(80));
      
      // Main interview loop
      while (true) {
        console.log("\n" + "-".repeat(50));
        const userInput = await askQuestion(rl, "\n👤 Your Response: ");
        const trimmedInput = userInput.trim();
        
        if (trimmedInput.toLowerCase() === 'exit') {
          console.log("\n🏁 Interview Ended");
          console.log(interviewer.getSummary(sessionId));
          console.log("\nThank you for using Prep Piper!");
          break;
        }
        
        if (trimmedInput.toLowerCase() === 'summary') {
          console.log(interviewer.getSummary(sessionId));
          continue;
        }
        
        if (trimmedInput.toLowerCase() === 'save') {
          await interviewer.saveSession(sessionId);
          continue;
        }
        
        if (!trimmedInput) {
          console.log("💭 Please provide an answer, or use 'exit', 'summary', or 'save' commands.");
          continue;
        }
        
        // Process the answer and get next question
        console.log("🔄 Processing your answer...");
        const response = await interviewer.processAnswer(sessionId, trimmedInput);
        console.log(`\n🎤 Interviewer: ${response}`);
      }
      
    } finally {
      rl.close();
    }
    
  } catch (error) {
    if (error instanceof Error && error.message === 'SIGINT') {
      console.log("\n\n⏸️  Interview interrupted by user");
    } else {
      console.log(`\n🚨 Critical error: ${error}`);
      console.log(`Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
      if (error instanceof Error) {
        console.log(error.stack);
      }
    }
  }
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n⏸️  Interview interrupted by user');
  process.exit(0);
});

// Main execution
if (require.main === module) {
  // Add debug info
  console.log("🟢 Node.js version:", process.version);
  console.log("📂 Current directory:", process.cwd());
  console.log("📄 Script file:", __filename);
  console.log();
  
  main().catch((error) => {
    console.log(`\n💥 Fatal error in main(): ${error}`);
    if (error instanceof Error) {
      console.log(error.stack);
    }
    process.exit(1);
  });
}