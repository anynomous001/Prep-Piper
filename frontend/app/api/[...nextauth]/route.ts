// app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// <— Add this:
// export default handlers
