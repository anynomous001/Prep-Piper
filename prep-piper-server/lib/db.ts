
// Temporary test - remove after it works
let db: any;

try {
  const { PrismaClient } = require('@prisma/client')
  console.log('✅ Prisma Client imported successfully')

  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined
  }

  db =
    globalForPrisma.prisma ??
    new PrismaClient({
      // log: ['query'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
} catch (error) {
  console.error('❌ Failed to import:', error)
}

export { db };






