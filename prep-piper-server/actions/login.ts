"use server"

import * as z from 'zod'
import { LoginSchema } from '@/schemas'
import { signIn } from '@/lib/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { AuthError } from 'next-auth'

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
      redirect: false, // Important: Set to false to handle redirect manually
    })

    if (result?.error) {
      return { success: false, message: "Invalid credentials!" }
    }

    return { success: true, message: "Login successful!" }
  } catch (error) {
    console.error("Login error:", error)
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password!" }
        case "CallbackRouteError":
          return { success: false, message: "Database connection error!" }
        default:
          return { success: false, message: `Authentication error: ${error.type}` }
      }
    }

    return { success: false, message: "An unexpected error occurred!" }
  }
}
