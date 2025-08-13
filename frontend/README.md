# Prep Piper - AI Voice Interview Platform

A modern, animated frontend for real-time AI voice interview practice with comprehensive backend integration.

## Features

- **Real-time AI Interview Practice**: Interactive voice-based interview sessions
- **WebSocket Integration**: Live communication for transcripts and feedback
- **Speech Recognition**: Browser-based voice-to-text conversion
- **Audio Recording**: High-quality audio capture and processing
- **Animated UI**: Smooth Framer Motion animations and microinteractions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Architecture

### Frontend Components
- **Landing Page**: Hero section with feature highlights and call-to-action
- **Interview Interface**: Real-time interview session management
- **Component Library**: Reusable UI components with animations

### Backend Integration
- **WebSocket Manager**: Real-time bidirectional communication
- **API Client**: RESTful API integration for session management
- **Speech Processing**: Real-time transcript and audio handling

### Key Integration Points

#### WebSocket Events
- `startInterview`: Initialize new interview session
- `interimTranscript`: Real-time speech-to-text updates
- `transcript`: Final transcript submission
- `audioGenerated`: AI-generated question audio
- `interviewComplete`: Session completion with feedback
- `audioChunk`: Streaming audio data

#### API Endpoints
- `POST /api/sessions`: Create new interview session
- `GET /api/sessions/:id`: Retrieve session details
- `POST /api/sessions/:id/next-question`: Get next interview question
- `POST /api/responses`: Submit interview response
- `GET /api/health`: API health check

## Environment Variables

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_DEV_URL=http://localhost:3000
\`\`\`

## Getting Started

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Backend Setup**
   - Ensure your backend WebSocket server is running on the configured URL
   - Implement the required API endpoints for full functionality

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **Real-time**: WebSocket API
- **Audio**: Web Audio API, MediaRecorder API
- **Speech**: Web Speech API

## Integration Guide

### WebSocket Backend Requirements

Your backend should handle these WebSocket message types:

\`\`\`typescript
interface WebSocketMessage {
  type: 'startInterview' | 'interimTranscript' | 'transcript' | 'audioGenerated' | 'interviewComplete' | 'audioChunk'
  sessionId: string
  data: any
  timestamp: Date
}
\`\`\`

### API Backend Requirements

Implement these REST endpoints:

- Session management (CRUD operations)
- Question generation and audio synthesis
- Response processing and feedback generation
- Analytics and performance tracking

## Deployment

The application is ready for deployment on Vercel or any Next.js-compatible platform. Ensure your backend services are accessible from your deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
