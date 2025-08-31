"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="relative min-h-[80dvh] overflow-hidden bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(700px_400px_at_20%_10%,rgba(20,184,166,0.12),transparent)]"
      />
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-balance text-4xl font-semibold text-zinc-100 md:text-6xl"
        >
          Prep Piper
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-2xl text-pretty text-zinc-300"
        >
          Practice technical interviews with an AI interviewer. Speak or type your answers, get real-time transcripts,
          and progress through tailored questions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4 md:flex-row"
        >
          <Link href="/tech-selection">
            <Button className="bg-blue-500 text-white hover:bg-blue-400">Get started</Button>
          </Link>
          <p className="text-sm text-zinc-400">AI-Powered Questions • Real-Time Feedback • Voice or Text</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-4"
        >
          {["AI-Powered Questions", "Real-Time Feedback", "Voice Practice", "Text Input Option"].map((feat) => (
            <div key={feat} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-zinc-200">
              {feat}
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
