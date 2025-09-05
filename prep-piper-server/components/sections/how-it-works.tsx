"use client"

import { motion } from "framer-motion"

const steps = [
  { title: "Choose Your Focus", text: "Select role, tech stack, and experience level." },
  { title: "Practice Live", text: "Engage with AI interviewer in realistic scenarios." },
  { title: "Get Feedback", text: "Receive detailed analysis and improvement recommendations." },
]

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="how-heading" className="text-balance text-3xl font-semibold md:text-5xl text-teal-400">
          How it works
        </h2>
        <p className="mt-3 text-foreground/80">Three simple steps to accelerate your interview prep.</p>
      </div>

      <ol className="mx-auto mt-10 max-w-3xl space-y-8">
        {steps.map((s, idx) => (
          <motion.li
            key={s.title}
            className="relative grid gap-2 rounded-xl border border-border/60 bg-background/60 p-5 backdrop-blur md:grid-cols-[56px_1fr]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10 font-semibold">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-foreground/80">{s.text}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
