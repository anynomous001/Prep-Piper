"use server"

import * as z from 'zod'
import { LoginSchema } from '@/schemas'
import { signIn } from '@/lib/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'


export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" }
  }

  const { email, password } = validatedFields.data

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, 
    })

    if (result?.error) {
      const err = result.error

      // If the provider returned "CredentialsSignin", it’s your pending-approval case
      // if (err.includes("CredentialsSignin") || err === "Your account is pending approval.") {
      //   return {
      //     success: false,
      //     message: "Your account is pending approval. Please check your email."
      //   }
      // }

      // Invalid credentials
      if (err.includes("Invalid email") || err.includes("Invalid credentials")) {
        return { success: false, message: "Invalid email or password!" }
      }

      // Fallback
      return { success: false, message: err }
    }

    return { success: true, message: "Login successful!" }
  } catch (error) {
    console.error("Login error:", error)
    
    if (error instanceof AuthError) {
  if (error.type === "CallbackRouteError" && 
          error.cause?.err?.message?.includes("pending approval")) {
        redirect('/auth/pending-approval')
      }
        
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password!" }
        default:
          return { success: false, message: `Authentication error: ${error.type}` }
      }
    }

    return { success: false, message: "An unexpected error occurred!" }
  }
}
