// <------------ this is a new update---->
"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, title: "Role" },
    { number: 2, title: "Tech Stack" },
    { number: 3, title: "Difficulty" },
  ]

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.number < currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : step.number === currentStep
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-400"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {step.number < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
              </motion.div>
              <span className="text-sm text-slate-400 mt-2">{step.title}</span>
            </div>

            {index < steps.length - 1 && (
              <div className="w-16 h-0.5 bg-slate-700 mx-4">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: "0%" }}
                  animate={{
                    width: step.number < currentStep ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
// <---------------------------------------->
