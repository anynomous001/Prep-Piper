"use strict";
/**
 * Voice-Integrated Technical Interview Agent
 * Combines STT, TTS, and Interview logic for live voice interviews
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
const readline = __importStar(require("readline"));
const groq_1 = require("@langchain/groq");
const messages_1 = require("@langchain/core/messages");
const sdk_1 = require("@deepgram/sdk");
// Load environment variables
(0, dotenv_1.config)();
class VoiceInterviewAgent {
    sessions = {};
    maxQuestions = 5;
    llm;
    deepgram;
    currentConnection = null;
    isListening = false;
    currentSessionId = '';
    transcriptionBuffer = '';
    speechTimeout = null;
    constructor() {
        try {
            // Initialize LLM
            this.llm = new groq_1.ChatGroq({
                model: "moonshotai/kimi-k2-instruct",
                temperature: 0.3,
                maxRetries: 2
            });
            // Initialize Deepgram
            this.deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY);
            console.log("✓ Voice Interview Agent initialized successfully");
        }
        catch (error) {
            console.log(`❌ Error initializing Voice Interview Agent: ${error}`);
            throw error;
        }
    }
    /**
     * Start a new voice interview session
     */
    async startVoiceInterview(techStack = "Python, JavaScript, React", position = "Software Developer") {
        try {
            const sessionId = (0, uuid_1.v4)().substring(0, 8);
            this.currentSessionId = sessionId;
            this.sessions[sessionId] = {
                tech_stack: techStack,
                position: position,
                question_count: 0,
                difficulty: 'beginner',
                conversation_history: [],
                is_complete: false,
                is_voice_mode: true
            };
            const firstTech = techStack.split(',')[0]?.trim() || techStack;
            const initialMessage = `Hello! I'm Prep Piper, your AI interviewer for today's ${position} interview.

I see your tech stack includes: ${techStack}

Let's start with something fundamental. Can you explain what ${firstTech} is and describe one project where you've used it effectively?

Please speak your answer clearly, and I'll be listening.`;
            this.sessions[sessionId].conversation_history.push({
                role: 'interviewer',
                content: initialMessage,
                timestamp: new Date()
            });
            // Speak the initial message
            await this.speakMessage(initialMessage);
            // Start listening after speaking
            await this.startListening();
            return [sessionId, initialMessage];
        }
        catch (error) {
            console.log(`❌ Error starting voice interview: ${error}`);
            return [null, `Error: ${error}`];
        }
    }
    /**
     * Convert text to speech and play it
     */
    async speakMessage(text) {
        try {
            console.log(`🔊 AI Speaking: ${text.substring(0, 100)}...`);
            const response = await this.deepgram.speak.request({ text }, {
                model: "aura-2-thalia-en",
                encoding: "linear16",
                container: "wav",
            });
            const stream = await response.getStream();
            if (stream) {
                const buffer = await this.getAudioBuffer(stream);
                // Create output directory if it doesn't exist
                const outputDir = path.join(process.cwd(), 'audio_output');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                const filename = path.join(outputDir, `response_${Date.now()}.wav`);
                fs.writeFileSync(filename, buffer);
                console.log(`🎵 Audio saved to: ${filename}`);
                console.log("💡 In a real implementation, you would play this audio file automatically");
                // Simulate speaking delay (in real app, this would be actual audio playback time)
                await new Promise(resolve => setTimeout(resolve, Math.max(text.length * 50, 2000)));
            }
        }
        catch (error) {
            console.log(`❌ Error in text-to-speech: ${error}`);
        }
    }
    /**
     * Helper function to convert stream to audio buffer
     */
    async getAudioBuffer(response) {
        const reader = response.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            chunks.push(value);
        }
        const dataArray = chunks.reduce((acc, chunk) => Uint8Array.from([...acc, ...chunk]), new Uint8Array(0));
        return Buffer.from(dataArray.buffer);
    }
    /**
     * Start listening for speech input
     */
    async startListening() {
        try {
            console.log("\n🎤 Listening for your response... (speak now)");
            console.log("💡 Press Ctrl+C to stop the interview");
            this.isListening = true;
            this.transcriptionBuffer = '';
            // Create live transcription connection
            this.currentConnection = this.deepgram.listen.live({
                model: "nova-2",
                language: "en-US",
                smart_format: true,
                interim_results: true,
                end_utterance_silence_threshold: 2000, // 2 seconds of silence
                utterance_end_ms: 3000 // 3 seconds to end utterance
            });
            this.currentConnection.on(sdk_1.LiveTranscriptionEvents.Open, () => {
                console.log("🟢 Voice connection opened - start speaking!");
            });
            this.currentConnection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
                const transcript = data.channel.alternatives[0].transcript;
                if (transcript && transcript.trim()) {
                    if (data.is_final) {
                        this.transcriptionBuffer += transcript + ' ';
                        console.log(`📝 You said: ${transcript}`);
                        // Reset speech timeout
                        if (this.speechTimeout) {
                            clearTimeout(this.speechTimeout);
                        }
                        // Set timeout to process answer after silence
                        this.speechTimeout = setTimeout(() => {
                            this.processVoiceAnswer();
                        }, 3000); // 3 seconds of silence before processing
                    }
                }
            });
            this.currentConnection.on(sdk_1.LiveTranscriptionEvents.Error, (err) => {
                console.error("❌ Transcription error:", err);
            });
            this.currentConnection.on(sdk_1.LiveTranscriptionEvents.Close, () => {
                console.log("🔴 Voice connection closed");
                this.isListening = false;
            });
            // Simulate microphone input (in real app, you'd connect to actual microphone)
            console.log("💡 Note: This demo uses simulated audio. In production, connect to microphone.");
        }
        catch (error) {
            console.log(`❌ Error starting voice listening: ${error}`);
        }
    }
    /**
     * Process the voice answer and continue interview
     */
    async processVoiceAnswer() {
        if (!this.transcriptionBuffer.trim()) {
            console.log("🤔 I didn't catch that. Could you please repeat your answer?");
            await this.speakMessage("I didn't catch that. Could you please repeat your answer?");
            return;
        }
        const answer = this.transcriptionBuffer.trim();
        console.log(`\n✅ Processing your answer: "${answer}"`);
        // Clear buffer
        this.transcriptionBuffer = '';
        try {
            const response = await this.processAnswer(this.currentSessionId, answer);
            if (this.sessions[this.currentSessionId]?.is_complete) {
                // Interview completed
                await this.speakMessage(response);
                this.stopListening();
            }
            else {
                // Continue with next question
                await this.speakMessage(response);
                // Brief pause before listening again
                setTimeout(() => {
                    if (!this.sessions[this.currentSessionId]?.is_complete) {
                        this.startListening();
                    }
                }, 1000);
            }
        }
        catch (error) {
            console.log(`❌ Error processing voice answer: ${error}`);
            const errorMsg = "I'm sorry, I had trouble processing your answer. Could you please try again?";
            await this.speakMessage(errorMsg);
        }
    }
    /**
     * Stop listening for voice input
     */
    stopListening() {
        if (this.currentConnection) {
            this.currentConnection.finish();
            this.currentConnection = null;
        }
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
            this.speechTimeout = null;
        }
        this.isListening = false;
        console.log("🔴 Stopped listening");
    }
    /**
     * Process candidate answer and generate next question
     */
    async processAnswer(sessionId, answer) {
        try {
            if (!(sessionId in this.sessions)) {
                return "❌ Session not found! Please start a new interview.";
            }
            const session = this.sessions[sessionId];
            if (!session)
                return "Session error";
            if (session.is_complete) {
                return "✅ Interview already completed! Thank you for your time.";
            }
            // Validate answer
            if (!answer || answer.trim().length < 3) {
                return "🤔 I'd like to hear more from you. Please share your thoughts or ask for clarification if needed.";
            }
            // Add candidate's answer to history
            session.conversation_history.push({
                role: 'candidate',
                content: answer,
                timestamp: new Date()
            });
            // Increment question count
            session.question_count += 1;
            // Check if interview should end
            if (session.question_count >= this.maxQuestions) {
                session.is_complete = true;
                return this.generateCompletionMessage(sessionId);
            }
            // Generate next question
            const nextQuestion = await this.generateNextQuestion(sessionId);
            session.conversation_history.push({
                role: 'interviewer',
                content: nextQuestion,
                timestamp: new Date()
            });
            return nextQuestion;
        }
        catch (error) {
            console.log(`❌ Error processing answer: ${error}`);
            return `I'm having some technical difficulties. Let me ask you this: Could you tell me more about your experience with the technologies we discussed?`;
        }
    }
    /**
     * Generate next interview question
     */
    async generateNextQuestion(sessionId) {
        try {
            const session = this.sessions[sessionId];
            if (!session)
                return "Session error";
            // Create conversation context
            const recentConversation = session.conversation_history
                .slice(-4)
                .map(msg => `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`)
                .join('\n\n');
            // Create system prompt
            const systemContent = `You are a technical interviewer for a ${session.position} role conducting a VOICE interview.

INTERVIEW CONTEXT:
- Tech Stack: ${session.tech_stack}
- Question Number: ${session.question_count + 1} of ${this.maxQuestions}
- Current Level: ${session.difficulty}
- Mode: Voice Interview (responses will be spoken aloud)

RECENT CONVERSATION:
${recentConversation}

VOICE INTERVIEW GUIDELINES:
1. Keep questions concise and clear (good for voice)
2. Use natural, conversational language
3. Ask ONE specific question at a time
4. Gradually increase difficulty based on responses
5. Be encouraging and professional
6. Probe deeper when needed but keep it conversational
7. Focus on practical experience and problem-solving

TASK: Generate the next interview question that:
1. Builds on their previous response
2. Matches their demonstrated skill level
3. Is clear when spoken aloud
4. Covers ${session.tech_stack} technologies

Generate only the next question in a conversational tone suitable for voice delivery.`;
            const messages = [
                new messages_1.SystemMessage(systemContent),
                new messages_1.HumanMessage('Generate the next interview question.')
            ];
            const response = await this.llm.invoke(messages);
            let content;
            if (typeof response.content === 'string') {
                content = response.content;
            }
            else if (Array.isArray(response.content)) {
                content = response.content
                    .map(item => {
                    if (typeof item === 'string')
                        return item;
                    if ('text' in item)
                        return item.text;
                    return '';
                })
                    .join('')
                    .trim();
            }
            else {
                content = '';
            }
            return content || "Could you tell me more about your experience with the technologies we discussed?";
        }
        catch (error) {
            console.log(`❌ Error generating question: ${error}`);
            return "I'm having trouble generating the next question. Could you tell me about a challenging project you've worked on recently?";
        }
    }
    /**
     * Generate completion message
     */
    generateCompletionMessage(sessionId) {
        const session = this.sessions[sessionId];
        if (!session)
            return "Interview completed";
        return `🏁 Excellent! We've completed the interview.

Thank you for participating in this ${session.position} interview. You answered ${session.question_count} questions covering ${session.tech_stack}.

This concludes our voice interview session. You did great! The interview has been saved for review.`;
    }
    /**
     * Get session summary
     */
    getSummary(sessionId) {
        if (!(sessionId in this.sessions)) {
            return "❌ Session not found!";
        }
        const session = this.sessions[sessionId];
        if (!session)
            return "Session error";
        let summary = `
📊 **VOICE INTERVIEW SUMMARY**
═══════════════════════════════════════════════════════════════════

🆔 Session ID: ${sessionId}
📋 Position: ${session.position}
🛠️  Tech Stack: ${session.tech_stack}
🎤 Mode: Voice Interview
❓ Questions: ${session.question_count}/${this.maxQuestions}
📈 Difficulty: ${session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
✅ Status: ${session.is_complete ? 'Complete' : 'In Progress'}

📝 **CONVERSATION TRANSCRIPT:**
`;
        session.conversation_history.forEach((msg, index) => {
            const roleEmoji = msg.role === 'interviewer' ? '🎤' : '👤';
            const timestamp = msg.timestamp.toLocaleTimeString();
            summary += `\n${index + 1}. ${roleEmoji} ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)} (${timestamp}):\n${msg.content}\n${'-'.repeat(60)}\n`;
        });
        return summary;
    }
    /**
     * Save session to file
     */
    async saveSession(sessionId) {
        try {
            const interviewsDir = path.join(process.cwd(), 'voice_interviews');
            if (!fs.existsSync(interviewsDir)) {
                fs.mkdirSync(interviewsDir, { recursive: true });
            }
            const filename = path.join(interviewsDir, `voice_interview_${sessionId}.json`);
            const sessionData = JSON.stringify(this.sessions[sessionId], null, 2);
            fs.writeFileSync(filename, sessionData);
            console.log(`✅ Voice interview session saved to ${filename}`);
        }
        catch (error) {
            console.log(`❌ Save error: ${error}`);
        }
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopListening();
        console.log("🧹 Voice interview agent cleaned up");
    }
}
/**
 * Create readline interface for setup input
 */
function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}
/**
 * Async wrapper for readline question
 */
function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
/**
 * Main function for voice interview
 */
async function main() {
    let interviewer = null;
    try {
        console.log("🎤 Starting Voice Interview Agent...");
        console.log("=".repeat(60));
        // Check API keys
        if (!process.env.DEEPGRAM_API_KEY) {
            console.log("❌ DEEPGRAM_API_KEY not found in environment variables");
            return;
        }
        if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
            console.log("❌ LLM API key not found (GROQ_API_KEY or OPENAI_API_KEY)");
            return;
        }
        console.log("✓ API keys loaded");
        // Initialize voice interview agent
        console.log("\n🤖 Initializing Voice Interview Agent...");
        interviewer = new VoiceInterviewAgent();
        console.log("\n🎯 Welcome to Prep Piper - Voice Technical Interview!");
        console.log("This AI conducts live voice interviews based on your tech stack.\n");
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
            console.log("\n🎬 Starting voice interview...");
            console.log("💡 Make sure your speakers and microphone are ready!");
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Start voice interview
            const [sessionId, initialMessage] = await interviewer.startVoiceInterview(techStack, position);
            if (!sessionId) {
                console.log(`❌ Failed to start voice interview: ${initialMessage}`);
                return;
            }
            console.log("=".repeat(80));
            console.log(`🎯 VOICE INTERVIEW STARTED`);
            console.log(`📋 Position: ${position}`);
            console.log(`🛠️  Tech Stack: ${techStack}`);
            console.log(`🆔 Session ID: ${sessionId}`);
            console.log("=".repeat(80));
            // Keep the process alive for voice interview
            console.log("\n🎤 Voice interview is now active!");
            console.log("💡 Speak clearly and wait for questions");
            console.log("⏹️  Press Ctrl+C to end the interview\n");
            // Wait for interview completion or interruption
            process.stdin.resume();
        }
        finally {
            rl.close();
        }
    }
    catch (error) {
        console.log(`\n🚨 Critical error: ${error}`);
        if (error instanceof Error) {
            console.log(error.stack);
        }
    }
    finally {
        if (interviewer) {
            interviewer.cleanup();
        }
    }
}
// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\n\n⏸️  Voice interview interrupted by user');
    process.exit(0);
});
// Main execution
if (require.main === module) {
    console.log("🟢 Node.js version:", process.version);
    console.log("🎤 Voice Interview Agent");
    console.log("📂 Current directory:", process.cwd());
    console.log();
    main().catch((error) => {
        console.log(`\n💥 Fatal error in main(): ${error}`);
        if (error instanceof Error) {
            console.log(error.stack);
        }
        process.exit(1);
    });
}
//# sourceMappingURL=voiceAgent.js.map