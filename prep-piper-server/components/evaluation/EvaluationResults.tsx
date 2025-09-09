import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, AlertTriangle,
  User, Clock, TrendingUp, TrendingDown,
  Code, Brain, Star, BookOpen,
  Award, Zap
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Target } from 'lucide-react'

// Our existing design tokens & classes come from your setup


interface EvaluationData {
  success: boolean;
  evaluation_id: string;
  duration_ms: number;
  timestamp: string;
  data: {
    overall_score: number;
    recommendation: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire";
    key_strengths: string[];
    critical_weaknesses: string[];
    development_areas: string[];
    technical_skills: Array<{
      skill_name: string;
      proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
      evidence: string[];
      confidence: "low" | "medium" | "high" | "very_high";
      comments: string;
    }>;
    problem_solving_instances: Array<{
      problem_statement: string;
      solution: string;
      approach_quality: number;
      solution_effectiveness: number;
      reasoning_clarity: number;
    }>;
    position_evaluated_for: string;
    evaluation_timestamp: string;
    current_step: string;
    errors: string[];
  };
}

// Demo data
const demoData: EvaluationData = {
  "success": true,
  "evaluation_id": "unknown",
  "duration_ms": 1858,
  "timestamp": "2025-09-09T11:48:29.135Z",
  "data": {
    "overall_score": 3.5,
    "recommendation": "No Hire",
    "key_strengths": ["Basic understanding of responsive design", "Recognized Next.js as related to React"],
    "critical_weaknesses": ["Limited understanding of React concepts", "Lacked understanding of Next.js rendering strategies", "Limited knowledge of TypeScript features"],
    "development_areas": ["Improve React skills", "Learn TypeScript features", "Understand Next.js rendering strategies", "Enhance problem-solving approach"],
    "technical_skills": [
      {
        "skill_name": "JavaScript",
        "proficiency_level": "beginner",
        "evidence": ["Mentioned React hooks"],
        "confidence": "low",
        "comments": "Lacked clarity in explaining React hooks"
      },
      {
        "skill_name": "React",
        "proficiency_level": "beginner",
        "evidence": ["Mentioned React hooks"],
        "confidence": "low",
        "comments": "Limited understanding of React concepts"
      },
      {
        "skill_name": "TypeScript",
        "proficiency_level": "beginner",
        "evidence": ["Recognized TypeScript as related to JavaScript"],
        "confidence": "low",
        "comments": "Showed minimal understanding of TypeScript"
      },
      {
        "skill_name": "CSS",
        "proficiency_level": "beginner",
        "evidence": ["Mentioned responsive design"],
        "confidence": "low",
        "comments": "Basic understanding of responsive design"
      },
      {
        "skill_name": "Next.js",
        "proficiency_level": "beginner",
        "evidence": ["Recognized Next.js as related to React"],
        "confidence": "low",
        "comments": "Lacked understanding of Next.js rendering strategies"
      }
    ],
    "problem_solving_instances": [
      {
        "problem_statement": "Explain React hooks",
        "solution": "Described as functions",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      },
      {
        "problem_statement": "Improve performance",
        "solution": "Make the code faster",
        "approach_quality": 1,
        "solution_effectiveness": 1,
        "reasoning_clarity": 1
      },
      {
        "problem_statement": "Explain TypeScript",
        "solution": "TypeScript is just JavaScript but harder",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      },
      {
        "problem_statement": "Handle responsive design",
        "solution": "Websites work on phones",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      },
      {
        "problem_statement": "Explain Next.js rendering strategies",
        "solution": "Next.js makes websites faster",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      }
    ],
    "position_evaluated_for": "Frontend Developer",
    "evaluation_timestamp": "2025-09-09T11:48:29.090Z",
    "current_step": "completed",
    "errors": []
  }
};

const EvaluationPage: React.FC<{ data?: EvaluationData }> = ({ data = demoData}) => {
  const [tab, setTab] = useState('overview')

  // Animate overall score
  const [score, setScore] = useState(0)
  useEffect(() => {
    const increment = data.data.overall_score / 20
    let current = 0
    const animate = () => {
      current += increment
      if (current < data.data.overall_score) {
        setScore(current)
        requestAnimationFrame(animate)
      } else {
        setScore(data.data.overall_score)
      }
    }
    setTimeout(animate, 500)
  }, [data.data.overall_score])

  const recStyles = {
    'Strong Hire': 'text-green-600 bg-green-50 border border-green-200',
    'Hire': 'text-green-600 bg-green-50 border border-green-200',
    'No Hire': 'text-red-600 bg-red-50 border border-red-200',
    'Strong No Hire': 'text-red-700 bg-red-100 border border-red-300',
  }

  const recIcon = {
    'Strong Hire': <CheckCircle className="w-5 h-5" />,
    'Hire': <CheckCircle className="w-5 h-5" />,
    'No Hire': <XCircle className="w-5 h-5" />,
    'Strong No Hire': <XCircle className="w-5 h-5" />,
  }

  const getProficiencyColor = (level: string) => {
    return {
      'beginner': 'text-red-600 bg-red-100',
      'intermediate': 'text-orange-600 bg-orange-100',
      'advanced': 'text-blue-600 bg-blue-100',
      'expert': 'text-purple-600 bg-purple-100'
    }[level]
  }

  const getConfidenceColor = (conf: string) => {
    return {
      'low': 'text-red-600 bg-red-100',
      'medium': 'text-yellow-600 bg-yellow-50',
      'high': 'text-green-600 bg-green-50',
      'very_high': 'text-green-700 bg-green-100'
    }[conf]
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {/* Header */}
      <Card className="mb-8 shadow-md rounded-lg overflow-hidden">
        <CardHeader className="p-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{data.data.position_evaluated_for}</h1>
              <p className="text-sm text-gray-500">{new Date(data.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right space-y-1">
            <div className="flex items-center justify-end space-x-2">
              <Clock className="w-4 h-4" />
              <span>{(data.duration_ms/1000).toFixed(1)}s</span>
            </div>
            <div>ID: {data.evaluation_id}</div>
          </div>
        </CardHeader>
      </Card>

      {/* Score & Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Score Card */}
        <Card className="p-6 shadow-md rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center">
            {/* Score meter */}
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <circle className="stroke-gray-300" cx={50} cy={50} r={45} strokeWidth={6} fill="none" />
                <circle
                  className={cn('stroke-current', score >= 7 ? 'text-green-500' : score >= 5 ? 'text-yellow-500' : 'text-red-500')}
                  cx={50}
                  cy={50}
                  r={45}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={(2 * Math.PI * 45) * ((10 - score) / 10)}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                  }}
                />
              </svg>
              {/* Count */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{score.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">/ 10</div>
                </div>
              </div>
            </div>
            {/* Recommendation tag */}
            <div className={cn('inline-flex items-center px-4 py-2 rounded-full text-sm', recStyles)}>
              {recIcon[data.data.recommendation]}
              <span className="ml-2">{data.data.recommendation}</span>
            </div>
          </div>
        </Card>
        {/* Assessment Summary */}
        <Card className="p-6 shadow-md rounded-lg border border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium">Strengths</span>
              </div>
              <span className="font-bold text-green-600">{data.data.key_strengths.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-medium">Weaknesses</span>
              </div>
              <span className="font-bold text-red-600">{data.data.critical_weaknesses.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Tech Skills</span>
              </div>
              <span className="font-bold text-blue-600">{data.data?.technical_skills?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Problem Solving</span>
              </div>
              <span className="font-bold text-purple-600">{data.data.problem_solving_instances?.length || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab section */}
      <Card className="p-6 shadow-md rounded-lg border border-gray-200 bg-white mb-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 border-b border-gray-200">
            <TabsTrigger value="overview"><Star className="mr-2 W-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="technical"><Code className="mr-2 W-4 h-4" />Technical</TabsTrigger>
            <TabsTrigger value="problems"><Brain className="mr-2 W-4 h-4" />Problems</TabsTrigger>
            <TabsTrigger value="development"><BookOpen className="mr-2 W-4 h-4" />Dev</TabsTrigger>
          </TabsList>
          {/* Content for each tab */}
          <TabsContent value="overview">
            {/* Show key strengths and weaknesses */}
            <div className="space-y-4">
              {data.data.key_strengths.map((s,i) => (
                <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{s}</span>
                </div>
              ))}
              {data.data.critical_weaknesses.map((w,i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          {/* Technical Tab */}
          <TabsContent value="technical">
            {data.data.technical_skills.map((skill,i) => (
              <Card key={i} className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50" >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{skill.skill_name}</h4>
                  <div className="space-x-2">
                    <Badge variant={skill.proficiency_level}>{skill.proficiency_level}</Badge>
                    <Badge variant={skill.confidence}>{skill.confidence}</Badge>
                  </div>
                </div>
                <p className="text-sm">{skill.comments}</p>
                <ul className="list-disc list-inside text-sm mt-2">
                  {skill.evidence.map((e,j) => <li key={j}>{e}</li>)}
                </ul>
              </Card>
            ))}
          </TabsContent>

          {/* Problems */}
          <TabsContent value="problems">
            {data.data.problem_solving_instances.map((inst, i) => (
              <Card key={i} className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50" >
                <h4 className="font-medium mb-2">{inst.problem_statement}</h4>
                <p className="mb-2"><strong>Solution:</strong> {inst.solution}</p>
                <div className="grid grid-cols-3 gap-4 text-center text-sm font-semibold">
                  <div>
                    <div className="text-blue-600">{inst.approach_quality}/10</div>
                    <div>Approach</div>
                  </div>
                  <div>
                    <div className="text-green-600">{inst.solution_effectiveness}/10</div>
                    <div>Effectiveness</div>
                  </div>
                  <div>
                    <div className="text-purple-600">{inst.reasoning_clarity}/10</div>
                    <div>Clarity</div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          {/* Development Areas */}
          <TabsContent value="development">
            {data.data.development_areas.map((d,i) => (
              <div key={i} className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-orange-600" />
                <span>{d}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Final Action Buttons */}
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <Button variant="primary" className="w-full md:w-auto">
          <Award className="w-4 h-4 mr-2" />Generate Report
        </Button>
        <Button variant="secondary" className="w-full md:w-auto">
          <Zap className="w-4 h-4 mr-2" />Schedule Follow-up
        </Button>
      </div>
    </div>
  )
}

export default EvaluationPage;