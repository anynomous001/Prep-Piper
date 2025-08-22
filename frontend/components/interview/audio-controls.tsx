"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useState } from "react"

interface AudioControlsProps {
  audioUrl: string | null
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
}

export function AudioControls({ audioUrl, isPlaying, onPlay, onPause }: AudioControlsProps) {
  const [isMuted, setIsMuted] = useState(false)

  // if (!audioUrl) {
  //   return (
  //     <Card className="shadow-lg border-0 bg-slate-50">
  //       <CardContent className="p-6">
  //         <div className="flex items-center justify-center space-x-3 text-slate-400">
  //           <Volume2 className="w-6 h-6" />
  //           <p>Audio will appear here when the AI generates a response</p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
          <Volume2 className="mr-2 w-5 h-5 text-teal-600" />
          AI Audio Response
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Button
            onClick={isPlaying ? onPause : onPlay}
            size="lg"
            className={`w-14 h-14 rounded-full ${
              isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"
            } text-white transition-all duration-300 hover:scale-105`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>

          <div className="flex-1">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">AI Generated Audio</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              {isPlaying && (
                <div className="mt-2 flex space-x-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-teal-600 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-3">
          Listen to the AI's question before providing your response. You can replay it anytime.
        </p>
      </CardContent>
    </Card>
  )
}
