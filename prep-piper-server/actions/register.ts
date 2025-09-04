// actions/register.ts
"use server"

import * as z from 'zod'
import { RegisterSchema } from '@/schemas'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/data/user'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { 
      success: false, 
      message: "Invalid fields: " + validatedFields.error.issues.map(i => i.message).join(", ")
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return { success: false, message: "Email already registered!" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return { success: true, message: "Account created successfully!" }
  } catch (error) {
    console.error("Registration error:", error)
    
    if ((error as any)?.code === 'P2002') {
      return { success: false, message: "Email already exists!" }
    }
    
    if ((error as Error)?.message?.includes('DATABASE')) {
      return { success: false, message: "Database connection error!" }
    }

    return { success: false, message: "Failed to create account. Please try again." }
  }
}
