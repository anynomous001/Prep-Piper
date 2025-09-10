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

interface EvaluationData {
  success: boolean
  evaluation_id: string
  duration_ms: number
  timestamp: string
  data: {
    overall_score: number
    recommendation: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire"
    key_strengths: string[]
    critical_weaknesses: string[]
    development_areas: string[]
    technical_skills: Array<{
      skill_name: string
      proficiency_level: "beginner" | "intermediate" | "advanced" | "expert"
      evidence: string[]
      confidence: "low" | "medium" | "high" | "very_high"
      comments: string
    }>
    problem_solving_instances: Array<{
      problem_statement: string
      solution: string
      approach_quality: number
      solution_effectiveness: number
      reasoning_clarity: number
    }>
    position_evaluated_for: string
    evaluation_timestamp: string
    current_step: string
    errors: string[]
  }
}

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
  data = demoData,
}: {
  data?: EvaluationData
}) {
  const [tab, setTab] = useState<"overview" | "technical" | "problemsolving" | "development">("overview")
  const [score, setScore] = useState(0)

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
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur mb-8">
          <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="w-full">
            <TabsList className="bg-gray-800/50 p-1 rounded-lg border border-gray-700">
              {[
                { id: "overview", label: "Overview", icon: Star },
                { id: "technical", label: "Technical Skills", icon: Code },
                { id: "problemsolving", label: "Problem Solving", icon: Brain },
                { id: "development", label: "Development Areas", icon: Target },
              ].map((tabItem) => (
                <TabsTrigger
                  key={tabItem.id}
                  value={tabItem.id}
                  className={cn(
                    "flex items-center px-6 py-3 text-sm font-medium rounded-md transition-all",
                    tab === tabItem.id
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700",
                  )}
                >
                  <tabItem.icon className="w-4 h-4 mr-2" />
                  {tabItem.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-8">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-teal-300 mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Key Strengths
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {data.data.key_strengths.map((strength, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-teal-900/20 rounded-lg border border-teal-800/50"
                        >
                          <CheckCircle className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-200">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-red-300 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Critical Weaknesses
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {data.data.critical_weaknesses.map((weakness, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-red-900/20 rounded-lg border border-red-800/50"
                        >
                          <XCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-200">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-teal-300 mb-6 flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Technical Skills Assessment
                  </h3>
                  <div className="grid gap-6">
                    {data.data.technical_skills.length > 0 ? (
                      data.data.technical_skills.map((skill, index) => (
                        <Card
                          key={index}
                          className="bg-gray-800/50 border-gray-700 hover:border-teal-500/50 transition-colors backdrop-blur"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-teal-300">{skill.skill_name}</h4>
                                <div className="flex items-center mt-2 space-x-3">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      skill.proficiency_level === "expert"
                                        ? "bg-green-800 text-green-200 border-green-700"
                                        : skill.proficiency_level === "advanced"
                                          ? "bg-blue-800 text-blue-200 border-blue-700"
                                          : skill.proficiency_level === "intermediate"
                                            ? "bg-yellow-800 text-yellow-200 border-yellow-700"
                                            : "bg-red-800 text-red-200 border-red-700",
                                    )}
                                  >
                                    {skill.proficiency_level}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      skill.confidence === "very_high" || skill.confidence === "high"
                                        ? "bg-teal-800 text-teal-200 border-teal-700"
                                        : skill.confidence === "medium"
                                          ? "bg-yellow-800 text-yellow-200 border-yellow-700"
                                          : "bg-red-800 text-red-200 border-red-700",
                                    )}
                                  >
                                    {skill.confidence} confidence
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-3">{skill.comments}</p>
                            <div>
                              <p className="text-sm font-medium text-gray-200 mb-2">Evidence:</p>
                              <ul className="list-disc list-inside text-sm text-gray-300">
                                {skill.evidence.map((evidence, evidenceIndex) => (
                                  <li key={evidenceIndex}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">No technical skills data available</div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Problem Solving Tab */}
              <TabsContent value="problemsolving" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-teal-300 mb-6 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Problem Solving Assessment
                  </h3>
                  <div className="grid gap-6">
                    {data.data.problem_solving_instances.map((instance, index) => (
                      <Card
                        key={index}
                        className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors backdrop-blur"
                      >
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-purple-300 mb-3">{instance.problem_statement}</h4>
                          <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-600">
                            <p className="text-gray-200">
                              <strong className="text-teal-300">Solution:</strong> {instance.solution}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-400">{instance.approach_quality}/10</div>
                              <div className="text-sm text-gray-400">Approach Quality</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-400">
                                {instance.solution_effectiveness}/10
                              </div>
                              <div className="text-sm text-gray-400">Solution Effectiveness</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-400">{instance.reasoning_clarity}/10</div>
                              <div className="text-sm text-gray-400">Reasoning Clarity</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Development Tab */}
              <TabsContent value="development" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-teal-300 mb-6 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Development Areas
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.data.development_areas.length > 0 ? (
                      data.data.development_areas.map((area, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-orange-900/20 rounded-lg border border-orange-800/50"
                        >
                          <Target className="w-5 h-5 text-orange-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-200">{area}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 col-span-2">
                        No development areas data available
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
            <div className="flex space-x-4">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105">
                <Award className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105">
                <Zap className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
