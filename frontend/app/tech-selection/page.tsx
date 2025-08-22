"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { AnimatePresence } from "framer-motion"
import { RoleSelection } from "@/components/tech-selection/role-selection"
import { TechStackSelection } from "@/components/tech-selection/tech-stack-selection"
import { DifficultySelection } from "@/components/tech-selection/difficulty-selection"
import { ProgressIndicator } from "@/components/tech-selection/progress-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import type { RoleId, DifficultyId } from "@/lib/constants"
import { useInterviewWebSocket } from "@/hooks/use-interview-websocket"

export default function TechSelectionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null)
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId | null>(null)
  
  // Generate sessionId for WebSocket
  const [tempSessionId] = useState(() => uuidv4().substring(0, 8))
  
  const router = useRouter()

  useEffect(() => {
    // lock the history so back button does nothing
    //@ts-ignore
    window.history.pushState(null, null, window.location.href)
    window.onpopstate = () => {
      window.history.go(1)
    }
  }, [])

  const { connect, sendMessage,isConnected } = useInterviewWebSocket({
    sessionId: tempSessionId, // Use generated sessionId
    
    onInterviewStarted: (data) => {
      console.log("Interview confirmed started:", data)
    },
    onSttConnected: (data) => {
      console.log("STT connected:", data)
    },
    onInterimTranscript: (data) => {
      console.log("Interim transcript:", data.text)
    },
    onTranscript: (data) => {
      console.log("Final transcript:", data.text)
    },
    onAudioGenerated: (data) => {
      console.log("Audio generated:", data.audioUrl)
    },
    onInterviewComplete: (data) => {
      console.log("Interview complete:", data)
    },
    onError: (error) => {
      console.error("WebSocket error:", error)
    },
  })

  const handleBegin = async () => {
    try {
      console.log('handleBegin called')
      
      // 1. Save preferences first
      const interviewPreferences = {
        sessionId: tempSessionId,
        techStack: selectedTechs.join(', '), // Convert array to string
        role: selectedRole,
        difficulty: selectedDifficulty,
        position: selectedRole
      }
      localStorage.setItem('interviewPreferences', JSON.stringify(interviewPreferences))
      
     // 2. Connect to WebSocket and WAIT for it
    console.log('🔌 Connecting to WebSocket...')
    await connect()
    
    // 3. Check if actually connected
    // if (!isConnected) {
    //   throw new Error('Failed to establish WebSocket connection')
    // }
    
    console.log("✅ WebSocket connected successfully")

      // 3. Send startInterview message
      const payload = {
        techStack: selectedTechs.join(', '), // Convert array to string
        position: selectedRole, // Use position instead of role
        difficulty: selectedDifficulty
      }
      sendMessage("interviewStarted", payload)
      console.log("startInterview sent:", payload)

      // 4. Redirect to interview page
      router.push("/interview")
    } catch (error) {
      console.error("Error starting interview:", error)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      console.warn("handleNext called on final step - use handleBegin instead")
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
              onBegin={handleBegin} // ✅ CRITICAL FIX - Use handleBegin instead of handleNext
              onBack={handleBack}
              canProceed={canProceed()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
