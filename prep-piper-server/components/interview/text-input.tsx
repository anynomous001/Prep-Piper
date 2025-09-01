"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"


const MIN_CHARS = 10
const MAX_CHARS = 1500
const DRAFT_KEY = "prep-piper:text-draft"

interface TextInputProps {
  disabled?: boolean
  onSubmit: (text: string) => void
}

export function TextInput({ disabled, onSubmit }: TextInputProps) {
  const [value, setValue] = useState("")
  const count = value.length
  const isValid = !disabled && count >= MIN_CHARS && count <= MAX_CHARS

  // Load draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) setValue(draft)
    } catch {}
  }, [])

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, value)
    } catch {}
  }, [value])

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit(value.trim())
    setValue("")
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your response here. Ctrl+Enter to submit."
        className="min-h-32 resize-y bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
        maxLength={MAX_CHARS}
        disabled={disabled}
      />

      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            count > MAX_CHARS
              ? "text-red-500"
              : count < MIN_CHARS
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {count} / {MAX_CHARS}
        </span>
        <Button onClick={handleSubmit} disabled={!isValid} size="sm" className="gap-2">
          <Send className="h-4 w-4" />
          Submit
        </Button>
      </div>

      {count > 0 && count < MIN_CHARS && (
        <p className="text-xs text-yellow-600">
          Minimum {MIN_CHARS} characters required
        </p>
      )}
    </div>
  )
}
