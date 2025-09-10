// main.ts - Enhanced with debugging
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { runInterviewEvaluation } from './workflows/workflow';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ ENHANCED: Middleware with debugging
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ ADD: Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    console.log('📋 Headers:', req.headers);
    console.log('📦 Content-Type:', req.get('Content-Type'));
    console.log('📄 Raw Body Length:', req.get('Content-Length') || 'Not specified');
    next();
});

// ✅ ADD: Middleware to log parsed body
app.use((req, res, next) => {
    console.log('🔍 Parsed Body:', req.body);
    console.log('🔍 Body Type:', typeof req.body);
    console.log('🔍 Body Keys:', req.body ? Object.keys(req.body) : 'No keys');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Interview Evaluation API'
    });
});

// Main evaluation endpoint
app.post('/evaluate', async (req, res) => {
    console.log('📥 Received evaluation request');
    console.log('🔍 Final req.body check:', req.body);
    
    try {
        // Enhanced validation
        if (!req.body) {
            return res.status(400).json({
                success: false,
                error: 'Request body is empty or not parsed',
                debug: {
                    bodyReceived: !!req.body,
                    bodyType: typeof req.body,
                    contentType: req.get('Content-Type'),
                    contentLength: req.get('Content-Length')
                },
                solution: 'Ensure you send Content-Type: application/json header and valid JSON data'
            });
        }

        if (!req.body.interview_data) {
            return res.status(400).json({
                success: false,
                error: 'Missing interview_data in request body',
                receivedKeys: Object.keys(req.body),
                expectedFormat: {
                    interview_data: {
                        tech_stack: "string",
                        position: "string", 
                        question_count: "number",
                        difficulty: "string",
                        conversation_history: "array"
                    }
                }
            });
        }

        // Prepare initial state for workflow
        const initialState = {
            interview_data: req.body.interview_data,
            current_step: "initialization",
            technical_step: "pending", 
            problem_solving_step: "pending",
            errors: [],
            problem_solving_instances: [],
            problem_solving_score: 0,
            analytical_thinking_score: 0,
            debugging_potential_score: 0,
            problem_solving_approach: "",
            technical_skills: [],
            technical_consistency_score: 0,
            technical_depth_score: 0,
            technical_knowledge_gaps: [],
            technical_strengths: [],
            overall_score: 0,
            key_strengths: [],
            critical_weaknesses: [],
            position_evaluated_for: req.body.interview_data.position || "Frontend Developer",
            recommendation: "No Hire" as const,
            development_areas: [],
            evaluation_timestamp: "",
            candidate_id: req.body.interview_data.candidate_id || `candidate_${Date.now()}`
        };

        console.log(`🚀 Starting evaluation for position: ${initialState.position_evaluated_for}`);
        
        // Run the evaluation workflow  
        const startTime = Date.now();
        const result = await runInterviewEvaluation(initialState);
        const duration = Date.now() - startTime;

        console.log(`✅ Evaluation completed in ${duration}ms`);

        // Return successful response
        res.json({
            success: true,
            evaluation_id: result.candidate_id,
            duration_ms: req.body.interview_data.duration || duration,
            timestamp: new Date().toISOString(),
            data: {
                overall_score: result.overall_score,
                recommendation: result.recommendation,
                key_strengths: result.key_strengths,
                critical_weaknesses: result.critical_weaknesses,
                development_areas: result.development_areas,
                technical_skills: result.technical_skills,
                problem_solving_instances: result.problem_solving_instances,
                position_evaluated_for: result.position_evaluated_for,
                evaluation_timestamp: result.evaluation_timestamp,
                current_step: result.current_step,
                errors: result.errors
            }
        });

    } catch (error) {
        console.error('💥 Evaluation failed:', error);
        
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString(),
            evaluation_id: req.body?.candidate_id || null
        });
    }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler - Use regex pattern for Express 5 compatibility
app.use(/.*/, (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: {
            'GET /health': 'Health check',
            'POST /evaluate': 'Run interview evaluation'
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Interview Evaluation Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🎯 Evaluation endpoint: POST http://localhost:${port}/evaluate`);
    console.log('✅ Server ready to accept requests');
});

export { app };
