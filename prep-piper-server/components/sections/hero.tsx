"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Code2, Waves, MessageSquareMore } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 md:px-6 md:pb-20 md:pt-16"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-10 top-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          id="hero-heading"
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-6xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
        >
<span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Master Technical
          </span>
          <br />
          <span className="text-gray-900 dark:text-white">
            Interviews with AI
          </span>        </motion.h1>
        <motion.p
          className="text-pretty mt-4 text-base text-foreground/80 md:text-xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Practice coding interviews, system design, and behavioral questions with real-time feedback from our advanced
          AI interviewer.
        </motion.p>

        <motion.div
          className="mt-6 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Link href="/tech-selection">
          <Button
          
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:from-teal-400 hover:to-blue-400 px-8 py-6 text-lg hover:cursor-pointer"
            size="lg"
          >
            Start Free Practice
          </Button>
          </Link>
          <Button className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg hover:cursor-pointer" variant="outline" size="lg">
            Watch Demo
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div
          className="rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur"
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        >
          <div className="mb-3 flex items-center gap-2 text-sm text-foreground/70">
            <Code2 className="h-4 w-4" />
            <span>Live Code Snippet</span>
          </div>
          <div className="rounded-lg border border-border/50 bg-foreground/5 p-3 font-mono text-sm">
            <code>
              <span className="text-teal-400">function</span> <span className="text-blue-400">twoSum</span>(nums,
              target) {"{"}
              {"\n  "}const map = new Map()
              {"\n  "}for (let i = 0; i {"<"} nums.length; i++) {"{"}
              {"\n    "}const x = target - nums[i]
              {"\n    "}if (map.has(x)) return [map.get(x), i]
              {"\n    "}map.set(nums[i], i)
              {"\n  {" + "}"}
              {"\n  "}return []
              {"\n" + "}"}
            </code>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur"
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        >
          <div className="mb-3 flex items-center gap-2 text-sm text-foreground/70">
            <Waves className="h-4 w-4" />
            <span>Voice Waveform</span>
          </div>
          <div className="flex h-28 items-end gap-1 rounded-lg border border-border/50 bg-foreground/5 p-3">
            {Array.from({ length: 42 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-1 rounded-sm bg-teal-500/70"
                animate={{ height: [8, 24, 12, 18, 10, 28][i % 6] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8, delay: i * 0.02, ease: "easeInOut" }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
            <MessageSquareMore className="h-4 w-4" />
            <span>AI Feedback: Keep describing your approach as you code.</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-8 grid grid-cols-1 items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-4 text-center backdrop-blur sm:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <span className="text-xl font-semibold">10,000+</span>{" "}
          <span className="text-foreground/70">developers prepared</span>
        </div>
        <div>
          <span className="text-xl font-semibold">95%</span> <span className="text-foreground/70">success rate</span>
        </div>
        <div>
          <span className="text-xl font-semibold">24/7</span> <span className="text-foreground/70">available</span>
        </div>
      </motion.div>
    </section>
  )
}
