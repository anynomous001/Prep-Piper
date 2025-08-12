"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startInterview = startInterview;
const ttsService_1 = require("./ttsService");
const sstService_1 = require("./sstService");
const groq_1 = require("@langchain/groq");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const chat = new groq_1.ChatGroq({
    model: "moonshotai/kimi-k2-instruct",
    temperature: 0.3,
    maxRetries: 2
});
async function startInterview() {
    console.log("Interview starting...");
    const demoQuestions = [
        "Hello! I am your interview agent. Let's begin.",
        "Can you tell me a little about yourself?",
        "Why are you interested in this position?",
        "Describe a challenging situation you faced and how you handled it.",
        "What are your strengths and weaknesses?",
        "Where do you see yourself in five years?"
    ];
    for (let i = 0; i < demoQuestions.length; i++) {
        const question = demoQuestions[i];
        if (typeof question !== 'string')
            continue;
        console.log(`AI: ${question}`);
        await (0, ttsService_1.speakText)(question);
        if (i === 0)
            continue; // Skip listening for the greeting
        const candidateAnswer = await (0, sstService_1.listenAndTranscribe)();
        console.log(`Candidate: ${candidateAnswer}`);
    }
    const closing = "Thank you for your time. This concludes the interview.";
    await (0, ttsService_1.speakText)(closing);
    console.log("Interview finished.");
}
startInterview().catch((error) => {
    if (error instanceof Error) {
        console.error("Error during interview:", error.message, error.stack);
    }
    else {
        console.error("Error during interview:", error);
    }
});
//# sourceMappingURL=interviewAgent.js.map