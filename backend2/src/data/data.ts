export const demoInterviewData  = {
  candidate_id: "candidate_123",
  tech_stack: "React, JavaScript, TypeScript, CSS, HTML, Next.js",
  position: "Frontend Developer", 
  question_count: 5,
  difficulty: "intermediate",
  conversation_history: [
    {
      role: "interviewer",
      content: "Hello! I'm Prep Piper, your AI interviewer for today's Frontend Developer interview. I see your tech stack includes: React, JavaScript, TypeScript, CSS, HTML, Next.js. Let's start with something fundamental. Can you explain what React hooks are and describe a project where you've used useState and useEffect effectively?"
    },
    {
      role: "candidate",
      content: "Um, React hooks are like... functions I think? I know useState is for making variables and useEffect is for... doing stuff? I used them in a project once but I mostly just copied code from Stack Overflow. I think useState was like useState(0) or something and useEffect was for when the page loads maybe? I'm not really sure how they work exactly but they seem to make things work."
    },
    {
      role: "interviewer", 
      content: "I see. Let's try to go deeper into performance. How would you optimize a React application if it was running slowly? What techniques or patterns would you use to improve performance?"
    },
    {
      role: "candidate",
      content: "Performance? Hmm, I guess... make the code faster? I don't really know about performance stuff. Maybe use less CSS? I heard about something called useMemo but I never used it. Usually when my apps are slow I just refresh the page and hope it gets better. I don't really know what makes React apps slow or fast to be honest."
    },
    {
      role: "interviewer",
      content: "Let's talk about TypeScript since it's in your tech stack. How do you use TypeScript in your React projects? Can you explain the benefits and show me how you'd type a simple component?"
    },
    {
      role: "candidate", 
      content: "TypeScript is just JavaScript but harder, right? I tried to use it once but it kept showing red errors everywhere so I just added 'any' to everything to make the errors go away. I don't really understand why people use it. My components usually look like function Component(props: any) { return <div>{props.data}</div>; }. I know I should learn it better but regular JavaScript works fine for me."
    },
    {
      role: "interviewer",
      content: "How do you handle responsive design in your applications? What's your approach to making websites work on different screen sizes?"
    },
    {
      role: "candidate",
      content: "Responsive design... that's when websites work on phones too right? I usually just make everything really small and hope it fits. Sometimes I use CSS but I'm not very good with it. I heard about flexbox but it's confusing. Most of the time I just test on my laptop and assume it works on other devices. I don't really know about breakpoints or media queries."
    },
    {
      role: "interviewer",
      content: "Finally, let's discuss Next.js. You have it listed in your tech stack. Can you tell me about the different rendering strategies in Next.js and when you would use each one?"
    },
    {
      role: "candidate",
      content: "Next.js is like React but... bigger? I think it makes websites faster somehow. I don't really know about rendering strategies. I just run 'npm start' and it works. I know there's something called SSR and SSG but I couldn't tell you what they mean or when to use them. I mostly just use Next.js because it was already set up in the project I joined. The routing is automatic I think which is nice."
    },
    {
      role: "interviewer", 
      content: "🏁 **Interview Complete!** Thank you for participating in this Frontend Developer interview! 📊 **Session Summary:** - Questions Answered: 5/5 - Tech Stack Covered: React, JavaScript, TypeScript, CSS, HTML, Next.js - Significant knowledge gaps identified across all technical areas - Final Assessment: Requires substantial additional learning and development"
    }
  ]
};


interface EvaluationData {
  success: boolean;
  evaluation_id: string;
  duration_ms: number;
  timestamp: string;
  data: {
    overall_score: number;
    recommendation: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire";
    key_strengths: string[];
    critical_weaknesses: string[];
    development_areas: string[];
    technical_skills: Array<{
      skill_name: string;
      proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
      evidence: string[];
      confidence: "low" | "medium" | "high" | "very_high";
      comments: string;
    }>;
    problem_solving_instances: Array<{
      problem_statement: string;
      solution: string;
      approach_quality: number;
      solution_effectiveness: number;
      reasoning_clarity: number;
    }>;
    position_evaluated_for: string;
    evaluation_timestamp: string;
    current_step: string;
    errors: string[];
  };
}

// Demo data
const demoData: EvaluationData = {
  "success": true,
  "evaluation_id": "unknown",
  "duration_ms": 1858,
  "timestamp": "2025-09-09T11:48:29.135Z",
  "data": {
    "overall_score": 3.5,
    "recommendation": "No Hire",
    "key_strengths": ["Basic understanding of responsive design", "Recognized Next.js as related to React"],
    "critical_weaknesses": ["Limited understanding of React concepts", "Lacked understanding of Next.js rendering strategies", "Limited knowledge of TypeScript features"],
    "development_areas": ["Improve React skills", "Learn TypeScript features", "Understand Next.js rendering strategies", "Enhance problem-solving approach"],
    "technical_skills": [
      {
        "skill_name": "JavaScript",
        "proficiency_level": "beginner",
        "evidence": ["Mentioned React hooks"],
        "confidence": "low",
        "comments": "Lacked clarity in explaining React hooks"
      },
      {
        "skill_name": "React",
        "proficiency_level": "beginner",
        "evidence": ["Mentioned React hooks"],
        "confidence": "low",
        "comments": "Limited understanding of React concepts"
      },
      {
        "skill_name": "TypeScript",
        "proficiency_level": "beginner",
        "evidence": ["Recognized TypeScript as related to JavaScript"],
        "confidence": "low",
        "comments": "Showed minimal understanding of TypeScript"
      },
      {
        "skill_name": "CSS",
        "proficiency_level": "beginner",
        "evidence": ["Mentioned responsive design"],
        "confidence": "low",
        "comments": "Basic understanding of responsive design"
      },
      {
        "skill_name": "Next.js",
        "proficiency_level": "beginner",
        "evidence": ["Recognized Next.js as related to React"],
        "confidence": "low",
        "comments": "Lacked understanding of Next.js rendering strategies"
      }
    ],
    "problem_solving_instances": [
      {
        "problem_statement": "Explain React hooks",
        "solution": "Described as functions",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      },
      {
        "problem_statement": "Improve performance",
        "solution": "Make the code faster",
        "approach_quality": 1,
        "solution_effectiveness": 1,
        "reasoning_clarity": 1
      },
      {
        "problem_statement": "Explain TypeScript",
        "solution": "TypeScript is just JavaScript but harder",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      },
      {
        "problem_statement": "Handle responsive design",
        "solution": "Websites work on phones",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      },
      {
        "problem_statement": "Explain Next.js rendering strategies",
        "solution": "Next.js makes websites faster",
        "approach_quality": 2,
        "solution_effectiveness": 2,
        "reasoning_clarity": 2
      }
    ],
    "position_evaluated_for": "Frontend Developer",
    "evaluation_timestamp": "2025-09-09T11:48:29.090Z",
    "current_step": "completed",
    "errors": []
  }
};