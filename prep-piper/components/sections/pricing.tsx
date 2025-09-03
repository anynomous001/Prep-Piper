"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
    <section id="pricing" aria-labelledby="pricing-heading" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="pricing-heading" className="text-balance text-3xl font-semibold md:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-foreground/80">Choose a plan that scales with your preparation.</p>
      </div>

      <motion.div
        className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={`relative border-border/60 bg-background/60 backdrop-blur transition ${t.highlight ? "ring-1 ring-inset ring-teal-500/40" : ""}`}
          >
            {t.highlight && (
              <div className="absolute right-3 top-3 rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] font-medium text-teal-300 ring-1 ring-inset ring-teal-500/40">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{t.price}</span>
                <span className="text-sm text-foreground/70">{t.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="text-foreground/80">
                    • {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${t.highlight ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400" : ""}`}
                variant={t.highlight ? "default" : "outline"}
              >
                {t.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </motion.div>
    </section>
  )
}
