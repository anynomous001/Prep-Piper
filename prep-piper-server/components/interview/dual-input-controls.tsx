"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { VoiceControls } from "./voice-controls"
import { TextInput } from "./text-input"

export type InputMode = "voice" | "text"

export function DualInputControls({ disabled }: { disabled?: boolean }) {
  const [mode, setMode] = useState<InputMode>("voice")
  const toggle = (checked: boolean) => setMode(checked ? "text" : "voice")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-3">
        <Label className="text-zinc-300">Input Mode</Label>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${mode === "voice" ? "text-teal-300" : "text-zinc-400"}`}>Voice</span>
          <Switch checked={mode === "text"} onCheckedChange={toggle} />
          <span className={`text-sm ${mode === "text" ? "text-teal-300" : "text-zinc-400"}`}>Text</span>
        </div>
      </div>
      {mode === "voice" ? <VoiceControls disabled={disabled} /> : <TextInput />}
    </div>
  )
}
