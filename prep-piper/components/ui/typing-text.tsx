"use client"

import { useEffect, useState } from "react"

export function TypingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [out, setOut] = useState("")

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setOut((prev) => (i < text.length ? prev + text[i++] : prev))
      if (i >= text.length) clearInterval(id)
    }, 1000 / speed)
    return () => clearInterval(id)
  }, [text, speed])

  return <span>{out}</span>
}
