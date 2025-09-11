"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Code,
  Brain,
  Star,
  Target,
  Award,
  Zap,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { EvaluationData } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"



const demoData: EvaluationData = {
  success: true,
  evaluation_id: "candidate_56789",
  duration_ms: 1725,
  timestamp: "2025-09-09T12:05:42.200Z",
  data: {
    overall_score: 8.7,
    recommendation: "Hire",
    key_strengths: [
      "Strong grasp of React hooks and lifecycle",
      "Good understanding of performance optimization techniques",
      "Practical use of TypeScript with well-typed components",
      "Solid approach to responsive design using CSS Grid, Flexbox, and media queries",
      "Clear understanding of Next.js rendering strategies (SSR, SSG, ISR, CSR)"
    ],
    critical_weaknesses: [
      "Could deepen debugging strategies for complex issues",
      "Limited experience with advanced state management tools like Zustand/Recoil"
    ],
    development_areas: [
      "Enhance debugging practices with real-world scenarios",
      "Explore advanced state management libraries",
      "Experiment with testing frameworks like React Testing Library and Cypress"
    ],
    technical_skills: [
      {
        skill_name: "JavaScript",
        proficiency_level: "advanced",
        evidence: ["Explained closures and async/await clearly"],
        confidence: "high",
        comments: "Demonstrated strong fluency in ES6+ features"
      },
      {
        skill_name: "React",
        proficiency_level: "advanced",
        evidence: ["Used useState and useEffect effectively", "Discussed useMemo and React.memo for optimization"],
        confidence: "high",
        comments: "Solid grasp of hooks, performance tuning, and component design"
      },
      {
        skill_name: "TypeScript",
        proficiency_level: "intermediate",
        evidence: ["Typed props and component state correctly", "Explained union types and generics"],
        confidence: "medium",
        comments: "Good understanding, though occasionally defaulted to 'any'"
      },
      {
        skill_name: "Next.js",
        proficiency_level: "advanced",
        evidence: ["Explained SSR, SSG, ISR, and CSR with examples"],
        confidence: "high",
        comments: "Showed clear knowledge of when to apply each rendering strategy"
      },
      {
        skill_name: "CSS",
        proficiency_level: "advanced",
        evidence: ["Explained responsive design with media queries and Flexbox/Grid"],
        confidence: "high",
        comments: "Strong command of modern CSS layout techniques"
      }
    ],
    problem_solving_instances: [
      {
        problem_statement: "Explain React hooks",
        solution: "Accurately explained useState and useEffect with project examples",
        approach_quality: 5,
        solution_effectiveness: 5,
        reasoning_clarity: 5
      },
      {
        problem_statement: "Optimize React performance",
        solution: "Suggested memoization, code splitting, lazy loading, and reducing unnecessary re-renders",
        approach_quality: 5,
        solution_effectiveness: 5,
        reasoning_clarity: 4
      },
      {
        problem_statement: "Handle responsive design",
        solution: "Used CSS Grid, Flexbox, and media queries for adaptive layouts",
        approach_quality: 5,
        solution_effectiveness: 5,
        reasoning_clarity: 5
      },
      {
        problem_statement: "Explain Next.js rendering strategies",
        solution: "Correctly described SSR, SSG, ISR, CSR and when to use each",
        approach_quality: 5,
        solution_effectiveness: 5,
        reasoning_clarity: 5
      }
    ],
    position_evaluated_for: "Frontend Developer",
    evaluation_timestamp: "2025-09-09T12:05:42.150Z",
    current_step: "completed",
    errors: []
  }
};


export default function EvaluationResults({
  data, candidate_name
}: {
    data?: EvaluationData,
    candidate_name?: string
}) {
  const [tab, setTab] = useState<"overview" | "technical" | "problemsolving" | "development">("overview")
  const [score, setScore] = useState(0)
const router = useRouter();


  useEffect(() => {
    console.log("[v0] EvaluationResults data:", data)
    console.log("[v0] Development areas:", data.data.development_areas)
    console.log("[v0] Technical skills:", data.data.technical_skills)
    console.log("[v0] Current tab:", tab)
  }, [data, tab])

  useEffect(() => {
    const increment = data.data.overall_score / 20
    let current = 0
    function animate() {
      current += increment
      if (current < data.data.overall_score) {
        setScore(current)
        requestAnimationFrame(animate)
      } else {
        setScore(data.data.overall_score)
      }
    }
    const timer = setTimeout(animate, 500)
    return () => clearTimeout(timer)
  }, [data.data.overall_score])

  const recColors = {
    "Strong Hire": "bg-gradient-to-r from-teal-500 to-cyan-500",
    Hire: "bg-gradient-to-r from-teal-500 to-cyan-500",
    "No Hire": "bg-red-600",
    "Strong No Hire": "bg-red-700",
  } as const

  const recIcons = {
    "Strong Hire": <CheckCircle className="w-5 h-5" />,
    Hire: <CheckCircle className="w-5 h-5" />,
    "No Hire": <XCircle className="w-5 h-5" />,
    "Strong No Hire": <XCircle className="w-5 h-5" />,
  } as const

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Grid Background */}
      <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />

      {/* Radial fade overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <Card className="mb-10 bg-gray-900/50 border-gray-800 backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <User className="text-teal-400 w-10 h-10" />
              <div>
                <CardTitle className="text-3xl font-bold text-teal-300">Interview Evaluation Results</CardTitle>
                <p className="text-gray-300 text-lg">
                  {data.data.position_evaluated_for} • {new Date(data.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-gray-300">
                <Clock className="w-6 h-6" />
                <span>{(data.duration_ms / 1000).toFixed(2)}s eval time</span>
              </div>
              <span className="text-gray-400 text-sm">ID: {data.evaluation_id}</span>
            </div>
          </CardHeader>
        </Card>

        {/* Score & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Overall Score Card */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="text-center p-8">
              <h1 className="text-3xl font-semibold text-teal-400 mb-6">{candidate_name}</h1>
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Overall Score</h2>
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-700"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className={score >= 7 ? "text-teal-400" : score >= 5 ? "text-yellow-500" : "text-red-500"}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - score / 10)}
                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 10),
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-300">{score.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">/ 10</div>
                  </div>
                </div>
              </div>
              <Button
                className={cn(
                  "inline-flex items-center px-6 py-3 rounded-full font-semibold text-white transition-all duration-300",
                  recColors[data.data.recommendation],
                  "hover:opacity-90 hover:scale-105",
                )}
              >
                {recIcons[data.data.recommendation]}
                <span className="ml-2">{data.data.recommendation}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Summary Card */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-200 mb-6">Assessment Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-teal-400 mr-3" />
                      <span className="font-medium text-teal-300">Strengths</span>
                    </div>
                    <span className="font-bold text-teal-400 text-2xl">{data.data.key_strengths.length}</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-red-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingDown className="w-5 h-5 text-red-400 mr-3" />
                      <span className="font-medium text-red-300">Weaknesses</span>
                    </div>
                    <span className="font-bold text-red-400 text-2xl">{data.data.critical_weaknesses.length}</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Code className="w-5 h-5 text-blue-400 mr-3" />
                      <span className="font-medium text-blue-300">Tech Skills</span>
                    </div>
                    <span className="font-bold text-blue-400 text-2xl">{data.data.technical_skills.length}</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-purple-400 mr-3" />
                      <span className="font-medium text-purple-300">Problem Solving</span>
                    </div>
                    <span className="font-bold text-purple-400 text-2xl">
                      {data.data.problem_solving_instances.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
       <Card className="bg-gray-900/50 border-gray-800 backdrop-blur mb-8 overflow-hidden">
  <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="w-full">
    {/* Enhanced Tab Header */}
    <div className="w-full flex justify-center">
      <TabsList className="bg-transparent p-2 w-[70vw] justify-between">
        {[
          { id: "overview", label: "Overview", icon: Star, gradient: "from-teal-500 to-cyan-500" },
          { id: "technical", label: "Technical Skills", icon: Code, gradient: "from-blue-500 to-teal-500" },
          { id: "problemsolving", label: "Problem Solving", icon: Brain, gradient: "from-purple-500 to-blue-500" },
          { id: "development", label: "Development Areas", icon: Target, gradient: "from-orange-500 to-red-500" },
        ].map((tabItem) => (
          <TabsTrigger
            key={tabItem.id}
            value={tabItem.id}
            className={cn(
              "group relative flex items-center px-4 py-4 text-sm font-semibold rounded-xl transition-all duration-300 w-12",
              "border border-transparent hover:border-gray-600/50 hover:cursor-pointer",
               "max-w-[200px] truncate",  
              tab === tabItem.id
                ? `bg-gradient-to-r ${tabItem.gradient} text-white shadow-lg shadow-teal-500/20 scale-105`
                : "text-gray-400 hover:text-white-100 hover:bg-gray-700/50"
            )}
          >
            <div className={cn(
              "flex items-center gap-3 relative z-10",
              tab === tabItem.id && "drop-shadow-sm"
            )}>
              <tabItem.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                tab === tabItem.id && "scale-110"
              )} />
              <span className="font-medium">{tabItem.label}</span>
            </div>
            
            {/* Active indicator */}
            {tab === tabItem.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* Hover glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              `bg-gradient-to-r ${tabItem.gradient}/10`
            )} />
          </TabsTrigger>
        ))}
      </TabsList>
    </div>

    <div className="p-8">
      {/* Overview Tab - Enhanced Layout */}
      <TabsContent value="overview" className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Key Strengths Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-white" />
                </div>
                Key Strengths
              </h3>
              <Badge variant="outline" className="bg-teal-900/30 border-teal-500/50 text-teal-300">
                {data.data.key_strengths.length} strengths
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {data.data.key_strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group relative p-5 bg-gradient-to-br from-teal-900/20 to-teal-800/10 rounded-xl border border-teal-700/30 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed">{strength}</p>
                    </div>
                  </div>
                  
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Critical Weaknesses Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                Areas for Improvement
              </h3>
              <Badge variant="outline" className="bg-red-900/30 border-red-500/50 text-red-300">
                {data.data.critical_weaknesses.length} areas
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {data.data.critical_weaknesses.map((weakness, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group relative p-5 bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-xl border border-red-700/30 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed">{weakness}</p>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </TabsContent>

      {/* Technical Skills Tab - Enhanced Layout */}
    <TabsContent value="technical" className="space-y-6">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent flex items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center mr-3">
          <Code className="w-4 h-4 text-white" />
        </div>
        Technical Skills Assessment
      </h3>
      <Badge variant="outline" className="bg-blue-900/30 border-blue-500/50 text-blue-300">
        {data.data.technical_skills.length} skills evaluated
      </Badge>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      {data.data.technical_skills.length > 0 ? (
        data.data.technical_skills.map((skill, index) => {
          // Get the appropriate logo/icon for each skill
          const getSkillIcon = (skillName: string) => {
            const name = skillName.toLowerCase();
            if (name.includes('javascript') || name.includes('js')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-lg">JS</span>
                </div>
              );
            }
            if (name.includes('react')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-cyan-400 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-cyan-900">
                    <path fill="currentColor" d="M12 10.11c1.03 0 1.87.84 1.87 1.89s-.84 1.89-1.87 1.89c-1.03 0-1.87-.84-1.87-1.89s.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7c-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5l-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9s-1.17 0-1.71.03c-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47c.54.03 1.11.03 1.71.03s1.17 0 1.71-.03c.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7c.52.59 1.03 1.23 1.51 1.9c.82.08 1.63.2 2.4.36c.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86c-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63c2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63c-1.46.84-3.45-.12-5.37-1.95c-1.92 1.83-3.91 2.79-5.37 1.95c-1.47-.84-1.63-3.05-1.01-5.63C.46 14.93 0 13.69 0 12s.46-2.93 4.37-3.68C3.75 5.74 3.91 3.53 5.38 2.69c1.46-.84 3.45.12 5.37 1.95c1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26c2.1-.63 3.28-1.53 3.28-2.26S20.07 10.37 17.97 9.74c-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26c-2.1.63-3.28 1.53-3.28 2.26s1.18 1.63 3.28 2.26c.25-.76.55-1.51.89-2.26"/>
                  </svg>
                </div>
              );
            }
            if (name.includes('typescript') || name.includes('ts')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">TS</span>
                </div>
              );
            }
            if (name.includes('next')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg border border-gray-600">
                  <span className="text-white font-bold text-xs">NEXT</span>
                </div>
              );
            }
            if (name.includes('css')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">CSS</span>
                </div>
              );
            }
            if (name.includes('html')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">HTML</span>
                </div>
              );
            }
            if (name.includes('node')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">NODE</span>
                </div>
              );
            }
            if (name.includes('python')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg">
                  <span className="text-blue-800 font-bold text-xs">PY</span>
                </div>
              );
            }
            if (name.includes('vue')) {
              return (
                <div className="w-12 h-12 rounded-xl bg-green-400 flex items-center justify-center shadow-lg">
                  <span className="text-green-900 font-bold text-lg">V</span>
                </div>
              );
            }
            // Default icon for unknown skills
            return (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
            );
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 backdrop-blur-sm h-full">
                <CardContent className="p-5">
                  {/* Header with Logo and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    {getSkillIcon(skill.skill_name)}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-teal-300 mb-1">{skill.skill_name}</h4>
                      <p className="text-xs text-gray-400">Technical Skill</p>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      className={cn(
                        "text-xs px-2 py-1 font-semibold uppercase",
                        skill.proficiency_level === "expert"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                          : skill.proficiency_level === "advanced"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            : skill.proficiency_level === "intermediate"
                              ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                              : "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                      )}
                    >
                      {skill.proficiency_level}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-xs px-2 py-1 font-semibold uppercase",
                        skill.confidence === "very_high" || skill.confidence === "high"
                          ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                          : skill.confidence === "medium"
                            ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                            : "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                      )}
                    >
                      {skill.confidence.replace('_', ' ')} confidence
                    </Badge>
                  </div>
                  
                  {/* Assessment */}
                  <div className="mb-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <h5 className="text-xs font-semibold text-teal-300 mb-2">Assessment</h5>
                      <p className="text-gray-300 text-sm leading-relaxed">{skill.comments}</p>
                    </div>
                  </div>
                  
                  {/* Evidence */}
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <h5 className="text-xs font-semibold text-blue-300 mb-2">Evidence</h5>
                    <ul className="space-y-1">
                      {skill.evidence.map((evidence, evidenceIndex) => (
                        <li key={evidenceIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 mt-1.5 flex-shrink-0"></div>
                          <span className="text-gray-300 text-xs leading-relaxed">{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      ) : (
        <div className="col-span-2 text-center py-12">
          <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No technical skills data available</p>
        </div>
      )}
    </div>
  </motion.div>
</TabsContent>

      {/* Problem Solving Tab - Enhanced Layout */}
      <TabsContent value="problemsolving" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                <Brain className="w-4 h-4 text-white" />
              </div>
              Problem Solving Assessment
            </h3>
            <Badge variant="outline" className="bg-purple-900/30 border-purple-500/50 text-purple-300">
              {data.data.problem_solving_instances.length} problems solved
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {data.data.problem_solving_instances.map((instance, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-purple-300 mb-2">{instance.problem_statement}</h4>
                        <p className="text-sm text-gray-400">Problem Solving Challenge</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl p-5 mb-6 border border-gray-600/50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-teal-300 mb-2">Solution Approach</h5>
                          <p className="text-gray-200 leading-relaxed">{instance.solution}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                          {instance.approach_quality}/10
                        </div>
                        <div className="text-xs text-blue-300 font-medium">Approach Quality</div>
                      </div>
                      <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                          {instance.solution_effectiveness}/10
                        </div>
                        <div className="text-xs text-green-300 font-medium">Solution Effectiveness</div>
                      </div>
                      <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                          {instance.reasoning_clarity}/10
                        </div>
                        <div className="text-xs text-purple-300 font-medium">Reasoning Clarity</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </TabsContent>

      {/* Development Tab - Enhanced Layout */}
      <TabsContent value="development" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-white" />
              </div>
              Development Areas
            </h3>
            <Badge variant="outline" className="bg-orange-900/30 border-orange-500/50 text-orange-300">
              {data.data.development_areas.length} growth opportunities
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {data.data.development_areas.length > 0 ? (
              data.data.development_areas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group relative p-5 bg-gradient-to-br from-orange-900/20 to-red-800/10 rounded-xl border border-orange-700/30 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed font-medium">{area}</p>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 col-span-2">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No development areas data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </TabsContent>
    </div>
  </Tabs>
</Card>

        {/* Action Buttons */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur hover:shadow-2xl transition-all duration-300">
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 p-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-200">What's Next?</h3>
              <p className="text-gray-400">Take action based on this evaluation</p>
            </div>
          
            <div className="flex space-x-3">
                          <Button 
                            onClick={() => router.push('/tech-selection')}
                            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                          >
                            Let us know you thoughts
                            <MessageSquare className="w-4 h-4 ml-2" />
                          </Button>
                          <Button 
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="flex-1  border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Home
                          </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


