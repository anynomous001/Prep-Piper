# Prep-Piper 🎯

> **AI-powered interview preparation platform** — adaptive mock interviews, real-time feedback, and personalized coaching powered by agentic AI workflows.

[![Live Demo](https://img.shields.io/badge/Live-prep--piper.vercel.app-0563C1?style=flat-square&logo=vercel)](https://prep-piper.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-82%25-3178C6?style=flat-square&logo=typescript)](https://github.com/anynomous001/Prep-Piper)
[![Python](https://img.shields.io/badge/Python-7.6%25-3776AB?style=flat-square&logo=python)](https://github.com/anynomous001/Prep-Piper)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-1a1a2e?style=flat-square)](https://langchain-ai.github.io/langgraph/)

---

## What is Prep-Piper?

Most interview prep tools give you static question banks. Prep-Piper is different — it runs a **live AI agent** that conducts your interview, adapts its questions based on your answers, analyzes your performance in real time, and coaches you on exactly where you need to improve.

Built for engineers and tech professionals who want to practice like it's the real thing.

---

## Features

- 🤖 **Adaptive AI Interviewer** — Agent dynamically adjusts question difficulty and topic depth based on your responses
- 📊 **Real-time Performance Analytics** — Detailed scoring on communication, technical accuracy, and depth of answers
- 🧠 **RAG-powered Question Engine** — Retrieval-augmented generation pulls from a curated knowledge base for domain-specific, accurate questions
- 🎯 **Personalized Coaching Flows** — Post-interview breakdowns with specific improvement recommendations
- 💬 **Multi-turn Conversation Memory** — Agent maintains full context across the interview session
- 📈 **Progress Tracking** — Track performance trends across multiple interview sessions

---

## Architecture

Prep-Piper is structured as a monorepo with clear separation of concerns:

```
Prep-Piper/
├── prep-piper-server/     # Main Next.js frontend + API routes
├── ai/                    # LangGraph agent definitions, RAG pipeline, prompts
├── backend2/              # Secondary backend service (auth, sessions, analytics)
├── backend3/              # Python AI microservice (embeddings, vector search)
└── notebooks/             # Jupyter notebooks for model experimentation & evals
```

### System Design

```
User (Browser)
     │
     ▼
Next.js Frontend (prep-piper-server)
     │
     ├──► REST API Routes ──► Session & Auth Service (backend2)
     │
     └──► AI Orchestration (ai/)
               │
               ├──► LangGraph Agent ──► Multi-turn interview conductor
               │         │
               │         └──► RAG Pipeline ──► Vector DB (question retrieval)
               │
               └──► Python AI Service (backend3)
                         │
                         └──► Embeddings + Semantic Search
```

### Key Technical Decisions

**Why LangGraph over a simple LLM call?**
The interview conductor isn't a single prompt — it's a stateful agent graph. Each node handles a distinct responsibility: question generation, answer evaluation, feedback synthesis, difficulty adjustment. LangGraph lets us model this as a proper state machine with conditional edges, so the agent can branch based on user performance (e.g., follow up deeper on weak answers, skip topics the user has clearly mastered).

**Why RAG for question generation?**
Raw LLM generation produces generic questions. The RAG pipeline retrieves relevant, domain-specific content from a curated knowledge base first, then generates questions grounded in that context — resulting in far more accurate and relevant interview questions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| AI Orchestration | LangGraph, LangChain, AI SDK |
| LLM | OpenAI API (GPT-4) |
| RAG Pipeline | Vector DB, Embeddings, Semantic Search |
| Backend Services | Node.js, Python, FastAPI |
| Auth & Sessions | backend2 service |
| AI Experimentation | Jupyter Notebooks |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/anynomous001/Prep-Piper.git
cd Prep-Piper
```

**Start the main server:**
```bash
cd prep-piper-server
npm install
cp .env.example .env.local   # Add your API keys
npm run dev
```

**Start the AI service:**
```bash
cd ai
npm install
npm run dev
```

**Start the Python backend:**
```bash
cd backend3
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

```env
# prep-piper-server/.env.local
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

---

## How It Works

1. **User starts a session** — selects role (e.g., Frontend Engineer), experience level, and focus areas
2. **Agent initializes** — LangGraph loads the interview state graph with appropriate context
3. **RAG retrieval** — relevant questions and domain knowledge are fetched from Vector DB
4. **Adaptive interview begins** — agent conducts multi-turn conversation, evaluating each response
5. **Real-time scoring** — answer quality, technical depth, and communication are scored per response
6. **Post-interview coaching** — detailed breakdown with specific, actionable improvement areas
7. **Progress saved** — performance data stored for trend tracking across sessions

---

## Project Status

🟢 **Active Development** — Core interview engine and feedback system are production-ready. Currently iterating on analytics depth and additional role-specific question banks.

---

## Author

**Pritam Chakroborty** — Full Stack AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-generative--ai--portfolio.vercel.app-0563C1?style=flat-square)](https://generative-ai-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-pritamchakroborty-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/pritamchakroborty/)
[![Twitter](https://img.shields.io/badge/X-@Pritamchak001-black?style=flat-square&logo=x)](https://twitter.com/Pritamchak001)
[![GitHub](https://img.shields.io/badge/GitHub-anynomous001-181717?style=flat-square&logo=github)](https://github.com/anynomous001)

---

## License

MIT
