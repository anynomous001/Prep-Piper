import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InterviewAgent } from '../services/interview/interviewAgent';

const router = express.Router();
const interviewAgent = new InterviewAgent();

router.post('/sessions', async (req, res) => {
  try {
    const { userId } = req.body;
    const [sessionId, initialMessage] = interviewAgent.startInterview();
    
    if (!sessionId) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    const session = {
      id: sessionId,
      userId,
      status: 'active',
      currentQuestionIndex: 0,
      totalQuestions: 5,
      startedAt: new Date(),
      progress: 0
    };

    res.json({ data: session });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const session = {
      id: req.params.id,
      status: 'active',
      currentQuestionIndex: 0,
      totalQuestions: 5,
      progress: 20
    };
    res.json({ data: session });
  } catch (error) {
 const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });  }
});

router.post('/sessions/:id/next-question', async (req, res) => {
  try {
    const { id } = req.params;
    const question = {
      id: uuidv4(),
      sessionId: id,
      questionIndex: 1,
      questionText: "Tell me about your experience with Node.js",
      generatedAt: new Date()
    };
    res.json({ data: question });
  } catch (error) {
 const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });  }
});

router.post('/sessions/:id/end', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
 const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });  }
});

router.post('/responses', async (req, res) => {
  try {
    const response = {
      id: uuidv4(),
      sessionId: req.body.sessionId,
      questionId: req.body.questionId,
      transcriptText: req.body.transcriptText,
      recordedAt: new Date()
    };
    res.json({ data: response });
  } catch (error) {
 const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });  }
});

export default router;
