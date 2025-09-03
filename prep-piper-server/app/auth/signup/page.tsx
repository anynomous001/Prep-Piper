"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema } from '@/schemas'
import { register as registerUser } from '@/actions/register'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import * as z from 'zod'

type Step = 0 | 1 | 2

export default function SignUpPage() {
  const [step, setStep] = useState<Step>(0)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("")
    setSuccess("")
    startTransition(() => {
      registerUser(values)
        .then((data) => {
          if (data.success) {
            setSuccess(data.message)
            // Optionally redirect to sign in
            setTimeout(() => {
              window.location.href = '/auth/signin'
            }, 2000)
          } else {
            setError(data.message)
          }
        })
        .catch(() => {
          setError("Something went wrong!")
        })
    })
  }

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

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3">
            <div className="text-green-800 text-sm">{success}</div>
          </div>
        )}

        {step === 0 && <StepEmail form={form} onNext={() => setStep(1)} />}
        {step === 1 && <StepPassword form={form} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepProfile 
            form={form} 
            onBack={() => setStep(1)} 
            onSubmit={onSubmit}
            pending={pending}
          />
        )}

        <p className="mt-4 text-center text-sm text-foreground/70">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-teal-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function StepEmail({ 
  form, 
  onNext 
}: { 
  form: any
  onNext: () => void 
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (form.watch("email")) {
          onNext()
        }
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          {...form.register("email")}
          required 
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
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

function StepPassword({ 
  form, 
  onBack, 
  onNext 
}: { 
  form: any
  onBack: () => void
  onNext: () => void 
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (form.watch("password")) {
          onNext()
        }
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="password">Create a password</Label>
        <Input 
          id="password" 
          type="password" 
          {...form.register("password")}
          required 
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
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

function StepProfile({ 
  form,
  onBack, 
  onSubmit,
  pending
}: { 
  form: any
  onBack: () => void
  onSubmit: (values: any) => void
  pending: boolean
}) {
  const [role, setRole] = useState("")
  const [exp, setExp] = useState("")
  const [agree, setAgree] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (agree && form.watch("name")) {
      const formData = form.getValues()
      onSubmit(formData)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input 
          id="name" 
          {...form.register("name")}
          disabled={pending}
          required 
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Input 
          id="role" 
          placeholder="e.g. Frontend Engineer" 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          disabled={pending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="exp">Experience</Label>
        <Input 
          id="exp" 
          placeholder="e.g. 3 years" 
          value={exp} 
          onChange={(e) => setExp(e.target.value)}
          disabled={pending}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox 
          id="terms" 
          checked={agree} 
          onCheckedChange={(v) => setAgree(Boolean(v))}
          disabled={pending}
        />
        <label htmlFor="terms" className="text-sm text-foreground/80">
          I agree to the Terms and Privacy Policy
        </label>
      </div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={!agree || !form.watch("name") || pending}
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
        >
          {pending ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
      <p className="text-center text-xs text-foreground/60">
        Welcome aboard! You'll see a brief onboarding preview after account creation.
      </p>
    </form>
  )
}
