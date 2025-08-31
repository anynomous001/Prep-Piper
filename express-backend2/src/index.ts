import 'dotenv/config'
import { VoiceInterviewServer } from './server/voiceInterviewServer'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

// Create server instance
const server = new VoiceInterviewServer()

// Start the server
server.start(PORT)

console.log(`🛠️ Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🚀 Fixed Voice Interview Server starting on port ${PORT}...`)
console.log(`🔧 Session isolation enabled`)
console.log(`🎤 Multi-session STT support enabled`)

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...')
  await server.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
  await server.stop()
  process.exit(0)
})

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})