import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Pricing } from "@/components/sections/pricing"
import { Reviews } from "@/components/sections/reviews"
import { DemoPreview } from "@/components/sections/demo-preview"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Prep Piper — Master Technical Interviews with AI",
  description: "Practice coding interviews, system design, and behavioral questions with real-time AI feedback.",
}

export default function Page() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Reviews />
        <DemoPreview />
      </main>
      <SiteFooter />
    </div>
  )
}
