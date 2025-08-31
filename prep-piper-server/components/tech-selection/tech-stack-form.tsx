"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { TechSelection } from "@/lib/types"

const POSITIONS = ["Software Developer", "Frontend Engineer", "Backend Engineer", "Data Scientist", "DevOps Engineer"]
const TECHS = ["JavaScript", "TypeScript", "Python", "React", "Node.js", "Next.js", "SQL", "Docker"]

export default function TechStackForm() {
  const [position, setPosition] = useState<string>("Software Developer")
  const [techs, setTechs] = useState<string[]>(["JavaScript", "React"])
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const router = useRouter()

  const toggleTech = (t: string, checked: boolean) => {
    setTechs((prev) => (checked ? [...prev, t] : prev.filter((x) => x !== t)))
  }

  const onContinue = () => {
    const payload: TechSelection = { position, techs, experience }
    localStorage.setItem("prep-piper:selection", JSON.stringify(payload))
    router.push("/interview")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-pretty text-zinc-100">Choose your focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-200">Job position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="bg-zinc-900 text-zinc-100 border-zinc-700">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-zinc-100">
                {POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-200">Tech stack</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TECHS.map((t) => {
                const checked = techs.includes(t)
                return (
                  <motion.label
                    key={t}
                    whileHover={{ scale: 1.02 }}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-200"
                  >
                    <Checkbox
                      className="data-[state=checked]:bg-teal-500"
                      checked={checked}
                      onCheckedChange={(v) => toggleTech(t, Boolean(v))}
                    />
                    {t}
                  </motion.label>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-200">Experience level</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                <motion.button
                  key={lvl}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setExperience(lvl)}
                  className={`rounded-md border p-3 text-sm capitalize ${
                    experience === lvl
                      ? "border-teal-500 bg-zinc-800 text-teal-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-200"
                  }`}
                >
                  {lvl}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onContinue} className="bg-blue-500 text-white hover:bg-blue-400">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
