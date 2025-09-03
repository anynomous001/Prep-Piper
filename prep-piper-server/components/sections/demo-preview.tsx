"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mic, Keyboard } from "lucide-react"
import { TypingText } from "@/components/ui/typing-text"
import { Skeleton } from "@/components/ui/skeleton"

const sampleQuestion =
  "Design a URL shortener service. Discuss API design, database schema, and scalability considerations."

export function DemoPreview() {
  const [voice, setVoice] = useState(true)
  const [loading, setLoading] = useState(false)

  const feedback = useMemo(
    () => [
      "Good start describing the API endpoints.",
      "Consider using hashing with collision handling for short codes.",
      "Discuss read-heavy optimizations: caching and CDN.",
    ],
    [],
  )

  return (
    <section aria-labelledby="demo-heading" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="demo-heading" className="text-balance text-3xl font-semibold md:text-4xl">
          Try the interview flow
        </h2>
        <p className="mt-3 text-foreground/80">
          Toggle voice or text, see real-time transcript, and preview AI feedback.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <motion.div
          className="rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/70">Question from AI:</p>
            <div className="flex items-center gap-2">
              <Mic className={`h-4 w-4 ${voice ? "text-teal-400" : "text-foreground/40"}`} aria-hidden="true" />
              <Switch id="mode" checked={voice} onCheckedChange={setVoice} />
              <Label htmlFor="mode" className="inline-flex items-center gap-1 text-xs text-foreground/70">
                {voice ? "Voice" : "Text"} <Keyboard className="h-3.5 w-3.5" />
              </Label>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border/60 bg-foreground/5 p-3 text-sm">{sampleQuestion}</div>

          <div className="mt-4">
            <p className="text-sm text-foreground/70">Transcript</p>
            <div className="mt-2 rounded-lg border border-border/60 bg-foreground/5 p-3 font-mono text-sm leading-relaxed">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              ) : (
                <TypingText
                  text="To design a URL shortener, I'd define endpoints for creating and resolving short codes, choose a database with fast reads, and plan for horizontal scaling..."
                  speed={24}
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1200)
              }}
            >
              Generate Feedback
            </Button>
            <Button variant="outline">Reset</Button>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <p className="text-sm text-foreground/70">AI Feedback</p>
          <ul className="mt-3 space-y-2">
            {feedback.map((f, i) => (
              <motion.li
                key={i}
                className="rounded-md border border-border/60 bg-foreground/5 p-3 text-sm"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                {f}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
