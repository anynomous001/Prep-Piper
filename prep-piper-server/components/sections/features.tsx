"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Bot, BarChart3, Target, Smartphone, TrendingUp } from "lucide-react"

const features = [
  {
    title: "Voice & Text Practice",
    description: "Practice speaking or typing your answers with real-time transcription.",
    icon: Mic,
  },
  {
    title: "AI-Powered Questions",
    description: "Tailored questions based on your target role and tech stack.",
    icon: Bot,
  },
  {
    title: "Real-Time Feedback",
    description: "Instant analysis of your responses, code quality, and communication.",
    icon: BarChart3,
  },
  {
    title: "Personalized Learning",
    description: "Adaptive difficulty based on your performance and experience level.",
    icon: Target,
  },
  {
    title: "Multi-Modal Support",
    description: "Practice on any device with voice, text, or hybrid modes.",
    icon: Smartphone,
  },
  { title: "Progress Tracking", description: "Detailed analytics and improvement suggestions.", icon: TrendingUp },
]

export function Features() {
  return (
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
        {features.map((f) => (
          <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
            <Card className="group h-full border-border/60 bg-background/60 backdrop-blur transition hover:border-teal-500/50 hover:shadow-[0_0_0_1px_rgba(20,184,166,.35)]">
              <CardHeader>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10 ring-1 ring-inset ring-border group-hover:ring-teal-500/50 transition">
                  <f.icon className="h-5 w-5 text-teal-400" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/80">{f.description}</CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
