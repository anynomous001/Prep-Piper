"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Step = 0 | 1 | 2

export default function SignUpPage() {
  const [step, setStep] = useState<Step>(0)

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute right-10 bottom-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-md rounded-xl border border-border/60 bg-background/60 p-6 backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-foreground/70">Get started in a few steps</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs">
          {["Email", "Password", "Profile"].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full ${i <= step ? "bg-teal-500" : "bg-foreground/20"}`} />
              <span className={i === step ? "text-foreground" : "text-foreground/60"}>{label}</span>
            </div>
          ))}
        </div>

        {step === 0 && <StepEmail onNext={() => setStep(1)} />}
        {step === 1 && <StepPassword onBack={() => setStep(0)} onNext={() => setStep(2)} />}
        {step === 2 && <StepProfile onBack={() => setStep(1)} />}
      </div>
    </div>
  )
}

function StepEmail({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState("")
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <Button
        type="submit"
        className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
      >
        Continue
      </Button>
    </form>
  )
}

function StepPassword({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [password, setPassword] = useState("")
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="password">Create a password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
        >
          Continue
        </Button>
      </div>
    </form>
  )
}

function StepProfile({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [exp, setExp] = useState("")
  const [agree, setAgree] = useState(false)

  return (
    <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" placeholder="e.g. Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="exp">Experience</Label>
        <Input id="exp" placeholder="e.g. 3 years" value={exp} onChange={(e) => setExp(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="terms" checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
        <label htmlFor="terms" className="text-sm text-foreground/80">
          I agree to the Terms and Privacy Policy
        </label>
      </div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={!agree || !name}
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
        >
          Create account
        </Button>
      </div>
      <p className="text-center text-xs text-foreground/60">
        Welcome aboard! You’ll see a brief onboarding preview after account creation.
      </p>
    </form>
  )
}
