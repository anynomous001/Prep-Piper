// actions/login.ts
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
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    })
    return { success: true, message: "Login successful!" }
  } catch (error) {
    console.error("Login error:", error)
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password!" }
        case "CallbackRouteError":
          return { success: false, message: "Database connection error!" }
        case "OAuthAccountNotLinked":
          return { success: false, message: "OAuth account not linked!" }
        default:
          return { success: false, message: `Authentication error: ${error.type}` }
      }
    }

    // Check if it's a redirect (successful login)
    if ((error as { message?: string })?.message?.includes('NEXT_REDIRECT')) {
      return { success: true, message: "Login successful!" }
    }

    return { success: false, message: "An unexpected error occurred!" }
  }
}
