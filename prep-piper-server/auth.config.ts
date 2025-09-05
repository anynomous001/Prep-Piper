import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Github from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import bcrypt from 'bcryptjs'
import { LoginSchema } from "@/schemas"
import { getUserByEmail } from "@/data/user"

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await getUserByEmail(email)
          if (!user || !user.password) return null

          const passwordMatch = await bcrypt.compare(password, user.password)

           if (!passwordMatch) {
         return null
        }

        if (!user.approved) {
          const error = new Error("Your account is pending approval.")
          error.name = "PendingApproval"
          throw error
        }

    // only after all checks pass:
    return user
  

        }

        return null
      }
    })
  ]
} satisfies NextAuthConfig
