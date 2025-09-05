// components/sections/HowItWorks.tsx
"use client"

import { motion } from "framer-motion"
import React from "react"

const steps = [
  { title: "Choose Your Focus", text: "Select role, tech stack, and experience level." },
  { title: "Practice Live", text: "Engage with AI interviewer in realistic scenarios." },
  { title: "Get Feedback", text: "Receive detailed analysis and improvement recommendations." },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 ">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-semibold text-teal-400">How it works</h2>
        <p className="mt-3 text-gray-300">Three simple steps to accelerate your interview prep.</p>
      </div>

      <ol className="mx-auto mt-10 max-w-3xl space-y-8">
        {steps.map((s, idx) => (
          <motion.li
            key={s.title}
            className="relative grid gap-4 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur p-6 md:grid-cols-[56px_1fr] transition hover:scale-105 hover:shadow-lg shadow-teal-500/25"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400 font-bold text-black">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-gray-300">{s.text}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
