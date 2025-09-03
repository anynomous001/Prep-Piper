"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const testimonials = [
  {
    name: "Ava Patel",
    role: "Software Engineer at Google",
    quote: "Prep Piper transformed my interview prep. The AI feedback is spot-on and helped me refine my explanations.",
    img: "/person-ava.jpg",
  },
  {
    name: "Lucas Kim",
    role: "Frontend Developer at Meta",
    quote: "I loved the real-time transcript and feedback. It felt like a realistic interview every session.",
    img: "/person-lucas.jpg",
  },
  {
    name: "Maya Singh",
    role: "Backend Engineer at Amazon",
    quote: "The personalized learning path helped me focus on weak areas. Highly recommend!",
    img: "/person-maya.jpg",
  },
]

export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="reviews-heading" className="text-balance text-3xl font-semibold md:text-4xl">
          Loved by developers
        </h2>
        <p className="mt-3 text-foreground/80">Join thousands who improved their interview outcomes with Prep Piper.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Card className="h-full border-border/60 bg-background/60 backdrop-blur">
              <CardHeader className="flex-row items-center gap-3">
                <img
                  src={t.img || "/placeholder.svg?height=48&width=48&query=headshot"}
                  alt={`Photo of ${t.name}`}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-foreground/70">{t.role}</div>
                  <div className="mt-1 flex items-center text-teal-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                    ))}
                    <span className="sr-only">5 star rating</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-foreground/90">“{t.quote}”</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 items-center gap-4 text-center text-sm text-foreground/50 sm:grid-cols-4">
        <span>Google</span>
        <span>Meta</span>
        <span>Amazon</span>
        <span>Netflix</span>
      </div>
    </section>
  )
}
