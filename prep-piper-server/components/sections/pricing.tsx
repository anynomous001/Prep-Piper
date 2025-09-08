// components/sections/Pricing.tsx
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import React from "react"
import { cn } from "@/lib/utils"
import { Container } from "../layout/container"

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["5 practice sessions/month", "Basic feedback"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: ["Unlimited sessions", "Advanced feedback", "Multiple tech stacks"],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/user/mo",
    features: ["Everything in Pro", "Team analytics", "Custom question sets"],
    cta: "Start Team",
    highlight: false,
  },
]

export function Pricing() {
  return (
    <Container>
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 ">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h2 className="text-4xl font-bold text-white">Simple, transparent pricing</h2>
        <p className="mt-3 text-gray-300">Choose a plan that scales with your preparation.</p>
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-2 md:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={cn(
              "relative backdrop-blur bg-gray-900/50 border border-gray-800 transition",
              t.highlight
                ? "ring-1 ring-inset ring-teal-500/40 hover:scale-105 shadow-xl shadow-teal-500/25 "
                : "hover:scale-105 shadow-lg shadow-black/20"
            )}
          >
            {t.highlight && (
              <div className="absolute top-3 right-3 bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40 px-2 py-0.5 rounded-full text-xs font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-white">{t.name}</CardTitle>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">{t.price}</span>
                <span className="text-sm text-gray-400">{t.period}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-gray-300">
                {t.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className={cn(
                  "w-full py-3 text-lg transition transform",
                  t.highlight
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 "
                    : "border border-gray-600 bg-slate-700 text-white hover:bg-gray-800 hover:text-teal-400"
                )}
              >
                {t.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </motion.div>
    </section>
    </Container>
  )
}
