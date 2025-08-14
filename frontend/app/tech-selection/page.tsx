"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { RoleSelection } from "@/components/tech-selection/role-selection"
import { TechStackSelection } from "@/components/tech-selection/tech-stack-selection"
import { DifficultySelection } from "@/components/tech-selection/difficulty-selection"
import { ProgressIndicator } from "@/components/tech-selection/progress-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import type { RoleId, DifficultyId } from "@/lib/constants"

export default function TechSelectionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null)
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId | null>(null)

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and redirect to interview
      console.log("Onboarding complete:", { selectedRole, selectedTechs, selectedDifficulty })
      // TODO: Save preferences and redirect to /interview
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedRole !== null
      case 2:
        return selectedTechs.length > 0
      case 3:
        return selectedDifficulty !== null
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PP</span>
            </div>
            <span className="text-xl font-bold font-display text-foreground">Prep Piper</span>
          </div>
          <ThemeToggle />
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={3} />

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <RoleSelection
              key="role"
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
              onNext={handleNext}
              canProceed={canProceed()}
            />
          )}

          {currentStep === 2 && selectedRole && (
            <TechStackSelection
              key="tech"
              selectedRole={selectedRole}
              selectedTechs={selectedTechs}
              onTechsChange={setSelectedTechs}
              onNext={handleNext}
              onBack={handleBack}
              canProceed={canProceed()}
            />
          )}

          {currentStep === 3 && (
            <DifficultySelection
              key="difficulty"
              selectedDifficulty={selectedDifficulty}
              onDifficultySelect={setSelectedDifficulty}
              onNext={handleNext}
              onBack={handleBack}
              canProceed={canProceed()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
