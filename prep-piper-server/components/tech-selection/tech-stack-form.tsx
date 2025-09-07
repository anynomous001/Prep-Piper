"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight } from "lucide-react"
import type { TechSelection } from "@/lib/types"

const POSITIONS = [
  "Software Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Generative AI Engineer"
];

const TECHS_BY_POSITION = {
  "Software Developer": [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "SQL",
    "Git & GitHub",
    "Data Structures & Algorithms",
    "Unit Testing (Jest, Mocha)",
    "Design Patterns",
    "Agile / Scrum",
    "REST & GraphQL APIs",
    "CI/CD Basics",
    "WebSockets",
    "Redis"
  ],

  "Frontend Engineer": [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Redux / Zustand",
    "TailwindCSS / Styled Components",
    "GraphQL",
    "Testing (Cypress, Jest, RTL)",
    "HTML5",
    "CSS3",
    "Webpack / Vite",
    "Responsive Design",
    "Accessibility (a11y)",
    "WebSockets",
    "Service Workers / PWA"
  ],

  "Backend Engineer": [
    "Node.js",
    "Express.js",
    "Python",
    "Django / FastAPI",
    "SQL (PostgreSQL, MySQL)",
    "NoSQL (MongoDB, Redis)",
    "REST APIs",
    "GraphQL APIs",
    "Docker",
    "Authentication & Authorization",
    "Microservices Architecture",
    "Message Queues (Kafka, RabbitMQ, Pub/Sub)",
    "Caching (Redis, Memcached)",
    "WebSockets"
  ],

  "Data Scientist": [
    "Python",
    "R",
    "SQL",
    "Pandas & NumPy",
    "Scikit-learn",
    "TensorFlow / PyTorch",
    "Matplotlib / Seaborn / Plotly",
    "Statistics & Probability",
    "Machine Learning Algorithms",
    "Data Cleaning & Feature Engineering",
    "Big Data (Spark, Hadoop)",
    "Data Visualization Tools (Tableau, PowerBI)",
    "Experimentation (A/B Testing)",
    "Streaming Data (Kafka, Pub/Sub)",
    "Feature Stores (Feast)"
  ],

  "DevOps Engineer": [
    "Docker",
    "Kubernetes",
    "AWS / Azure / GCP",
    "CI/CD (GitHub Actions, Jenkins, GitLab CI)",
    "Terraform / Ansible",
    "Linux & Shell Scripting",
    "Monitoring (Prometheus, Grafana, ELK Stack)",
    "Networking & Security",
    "Load Balancing & Scaling",
    "Version Control (Git)",
    "Service Mesh (Istio, Linkerd)",
    "Cloud Storage & Databases",
    "Secrets Management (Vault, KMS)",
    "Pub/Sub Systems",
    "Redis Caching"
  ],

  "Generative AI Engineer": [
    "Python",
    "JavaScript / TypeScript",
    "LangChain",
    "LangGraph",
    "RAG (Retrieval Augmented Generation)",
    "Guardrails",
    "Vector Databases (Pinecone, FAISS, Weaviate)",
    "LLM APIs (OpenAI, Anthropic, LLaMA)",
    "Hugging Face Transformers",
    "Prompt Engineering & Fine-tuning",
    "ML Frameworks (PyTorch, TensorFlow)",
    "MLOps Tools (MLflow, Weights & Biases)",
    "Evaluation Metrics (BLEU, ROUGE, perplexity)",
    "WebSockets (Realtime LLM apps)",
    "Redis (for caching embeddings)"
  ]
};


export default function TechStackForm() {
  const [position, setPosition] = useState<string>("Frontend Engineer")
  const [techs, setTechs] = useState<string[]>(["JavaScript", "React", "TypeScript"])
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const router = useRouter()

  // Get techs for current position
  const availableTechs = TECHS_BY_POSITION[position as keyof typeof TECHS_BY_POSITION] || []

  // Handle position change - reset selected techs and set defaults
  const handlePositionChange = (newPosition: string) => {
    setPosition(newPosition)
    
    // Set default techs based on position
    const positionTechs = TECHS_BY_POSITION[newPosition as keyof typeof TECHS_BY_POSITION] || []
    const defaultTechs = positionTechs.slice(0, 3) // First 3 techs as default
    setTechs(defaultTechs)
  }

  const toggleTech = (tech: string, checked: boolean) => {
    setTechs((prev) => (checked ? [...prev, tech] : prev.filter((x) => x !== tech)))
  }

  const onContinue = () => {
    const payload: TechSelection = { position, techs, experience }
    localStorage.setItem("prep-piper:selection", JSON.stringify(payload))
    router.push("/interview")
  }

  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-auto"
      >
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your Interview Focus
            </CardTitle>
            <p className="text-gray-300 text-lg">
              Customize your practice session to match your target role and skills
            </p>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Job Position */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-white">Job Position</Label>
              <Select value={position} onValueChange={handlePositionChange}>
                <SelectTrigger className="h-12 bg-gray-800 border-gray-700 text-white text-lg">
                  <SelectValue placeholder="Select your target position" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {POSITIONS.map((pos) => (
                    <SelectItem 
                      key={pos} 
                      value={pos}
                      className="text-white hover:bg-gray-700"
                    >
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-white">
                Tech Stack ({techs.length} selected)
              </Label>
              <p className="text-gray-400 text-sm">
                Select the technologies you want to be interviewed on
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTechs.map((tech) => {
                  const checked = techs.includes(tech)
                  return (
                    <motion.label
                      key={tech}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-all duration-300
                        ${checked 
                          ? "border-teal-500 bg-teal-500/10 text-teal-300" 
                          : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
                        }
                      `}
                    >
                      <Checkbox
                        className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                        checked={checked}
                        onCheckedChange={(v) => toggleTech(tech, Boolean(v))}
                      />
                      <span className="font-medium">{tech}</span>
                    </motion.label>
                  )
                })}
              </div>
              
              {techs.length === 0 && (
                <p className="text-yellow-400 text-sm">
                  ⚠️ Please select at least one technology
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-white">Experience Level</Label>
              <p className="text-gray-400 text-sm">
                This helps us adjust the difficulty of your questions
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                  <motion.button
                    key={level}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExperience(level)}
                    className={`
                      rounded-lg border p-4 text-center transition-all duration-300 font-medium
                      ${experience === level
                        ? "border-teal-500 bg-teal-500/10 text-teal-300"
                        : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
                      }
                    `}
                  >
                    <div className="text-lg capitalize">{level}</div>
                    <div className="text-xs mt-1 opacity-80">
                      {level === "beginner" && "0-2 years"}
                      {level === "intermediate" && "2-5 years"}  
                      {level === "advanced" && "5+ years"}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-6 border-t border-gray-800">
              <Button 
                onClick={onContinue}
                disabled={techs.length === 0}
                size="lg"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105 py-6 text-lg"
              >
                Start Interview Practice
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-center text-gray-400 text-sm mt-4">
                You can always change these settings later
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
