"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Brain, Target, BarChart3, MessageSquare, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Container } from "../layout/container"


const features = [
  {
    icon: <Mic className="w-8 h-8" />,
    title: "Voice-Powered Interviews",
    description: "Practice with natural speech recognition and real-time transcription for authentic interview experience.",
    badge: "Core Feature"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-Powered Feedback",
    description: "Get instant, detailed feedback on your technical explanations and problem-solving approach.",
    badge: "Smart AI"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Personalized Questions",
    description: "Questions adapted to your skill level, tech stack, and target companies for focused preparation.",
    badge: "Adaptive"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics and performance insights over time.",
    badge: "Analytics"
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: "Interactive Conversations",
    description: "Engage in natural back-and-forth discussions just like real technical interviews.",
    badge: "Dynamic"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Instant Setup",
    description: "Start practicing immediately with no complex setup or installation required.",
    badge: "Quick Start"
  }
]

export function Features() {
  return (
    <Container>
    <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="features-heading" className="text-balance text-3xl font-semibold md:text-6xl text-teal-400">
          Everything you need to practice effectively
        </h2>
        <p className="mt-3 text-foreground/80">
          Comprehensive tools to prepare across coding, system design, and behavioral interviews.
        </p>
      </div>

      <motion.div
        className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-12 md:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-teal-400/10 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-teal-400/10 rounded-lg text-teal-400 group-hover:bg-teal-400/20 transition-colors">
                    {feature.icon}
                  </div>
                  <Badge 
                    variant="secondary"
                    className="bg-gray-800 text-gray-300 border-gray-700 text-xs"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-teal-400 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
      </motion.div>
    </section>
    </Container>
  )
}
