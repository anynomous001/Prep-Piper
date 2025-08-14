// <------------ this is a new update---->
export const ROLES = {
  FRONTEND: {
    id: "frontend",
    title: "Frontend Developer",
    icon: "💻",
    description: "Build beautiful, interactive user interfaces and experiences",
    sampleTasks: [
      "Create responsive layouts with CSS Grid",
      "Implement React component architecture",
      "Optimize web performance and accessibility",
    ],
  },
  BACKEND: {
    id: "backend",
    title: "Backend Developer",
    icon: "⚙️",
    description: "Design and build robust server-side systems and APIs",
    sampleTasks: [
      "Design RESTful API endpoints",
      "Implement database schemas and queries",
      "Build scalable microservices architecture",
    ],
  },
  FULLSTACK: {
    id: "fullstack",
    title: "Full Stack",
    icon: "🔀",
    description: "Master both frontend and backend development",
    sampleTasks: [
      "Build end-to-end web applications",
      "Integrate frontend with backend APIs",
      "Deploy full-stack applications to cloud",
    ],
  },
  GENAI: {
    id: "genai",
    title: "Gen AI Engineer",
    icon: "🧠",
    description: "Build intelligent systems with AI and machine learning",
    sampleTasks: [
      "Implement RAG pipelines with vector databases",
      "Fine-tune language models for specific tasks",
      "Build AI-powered applications with LangChain",
    ],
  },
} as const

export const TECH_STACKS = {
  frontend: ["HTML5", "CSS3/TailwindCSS", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Svelte", "Next.js"],
  backend: [
    "Node.js/Express",
    "NestJS",
    "Python/Django",
    "Flask",
    "FastAPI",
    "Java/Spring Boot",
    "Go/Gin",
    "Echo",
    ".NET Core",
    "Ruby on Rails",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
  ],
  fullstack: [
    "HTML5",
    "CSS3/TailwindCSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Vue",
    "Next.js",
    "Node.js/Express",
    "Python/Django",
    "FastAPI",
    "PostgreSQL",
    "MongoDB",
    "MERN Stack",
    "MEAN Stack",
  ],
  genai: [
    "Python",
    "JavaScript/TypeScript",
    "Node.js",
    "TensorFlow",
    "PyTorch",
    "Hugging Face",
    "LangChain",
    "LangGraph",
    "Guardrails AI",
    "RAG Pipelines",
    "Pinecone",
    "Weaviate",
    "Milvus",
    "ChromaDB",
    "FastAPI/Flask",
    "OpenAI API",
    "Anthropic",
    "Google Gemini",
    "Streamlit",
    "Gradio",
  ],
} as const

export const DIFFICULTY_LEVELS = {
  ALPHA: {
    id: "alpha",
    title: "Alpha",
    subtitle: "Beginner",
    description: "Perfect for those starting their journey or switching careers",
    color: "from-green-600 to-emerald-600",
  },
  BETA: {
    id: "beta",
    title: "Beta",
    subtitle: "Intermediate",
    description: "For developers with some experience looking to level up",
    color: "from-blue-600 to-cyan-600",
  },
  GAMMA: {
    id: "gamma",
    title: "Gamma",
    subtitle: "Advanced",
    description: "For experienced developers seeking senior-level challenges",
    color: "from-purple-600 to-pink-600",
  },
} as const

export type RoleId = keyof typeof ROLES
export type DifficultyId = keyof typeof DIFFICULTY_LEVELS
// <---------------------------------------->
