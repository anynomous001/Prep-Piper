"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getSocket } from "@/components/connection/socket-manager"

const MIN_CHARS = 20
const MAX_CHARS = 1200
const DRAFT_KEY = "prep-piper:text-draft"

export function TextInput() {
  const [value, setValue] = useState("")
  const count = value.length
  const valid = useMemo(() => count >= MIN_CHARS && count <= MAX_CHARS, [count])

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) setValue(draft)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, value)
    } catch {}
  }, [value])

  const submit = () => {
    if (!valid) return
    const socket = getSocket()
    if (!socket.connected) return
    socket.emit("transcript", { text: value }) // send as text answer
    setValue("")
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your response here. Markdown supported."
        className="min-h-32 resize-y bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
        maxLength={MAX_CHARS}
      />
      <div className="flex items-center justify-between text-sm">
        <span className={count < MIN_CHARS ? "text-zinc-400" : "text-teal-300"}>
          {count} / {MAX_CHARS} characters
        </span>
        <Button
          onClick={submit}
          disabled={!valid}
          className="bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-50"
        >
          Submit
        </Button>
      </div>
      {!valid && <p className="text-sm text-zinc-400">Minimum {MIN_CHARS} characters required.</p>}
    </div>
  )
}
