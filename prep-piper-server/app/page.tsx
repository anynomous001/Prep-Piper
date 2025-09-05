import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Pricing } from "@/components/sections/pricing"
import { Reviews } from "@/components/sections/reviews"
import { DemoPreview } from "@/components/sections/demo-preview"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Prep Piper — Master Technical Interviews with AI",
  description: "Practice coding interviews, system design, and behavioral questions with real-time AI feedback.",
}

export default function Page() {
  return (
    <div className="min-h-dvh ">
      <SiteHeader />
      <main className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
      {/* Grid lines */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />

  {/* Radial fade overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      {/* Your landing content */}
      <div className="relative z-10 max-w-6xl px-6 py-20 text-center">
        {/* <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-6xl">
          Welcome to Prep Piper
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Your AI-powered mock interviewer to help you practice technical questions.
        </p> */}
        {/* Call-to-action buttons, etc. */}
      <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Reviews />
        <DemoPreview />
  </div>
      </main>



      <SiteFooter />
    </div>
  )
}
