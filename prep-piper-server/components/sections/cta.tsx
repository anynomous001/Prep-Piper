// components/sections/CTASection.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Background Card */}
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur border border-gray-800 rounded-3xl p-12 sm:p-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-teal-400/20 rounded-full">
                <Sparkles className="w-8 h-8 text-teal-400" />
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Next
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Technical Interview?
              </span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who've improved their interview skills with Prep Piper. 
              Start practicing today and land your dream job.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105 px-8 py-6 text-lg"
              >
                <Link href="/interview/setup" className="flex items-center gap-2">
                  Start Free Practice
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105 transition-all duration-300 px-8 py-6 text-lg"
                asChild
              >
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-10 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-4">Trusted by developers at</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <span className="text-gray-400 font-semibold">Google</span>
                <span className="text-gray-400 font-semibold">Meta</span>
                <span className="text-gray-400 font-semibold">Amazon</span>
                <span className="text-gray-400 font-semibold">Netflix</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}