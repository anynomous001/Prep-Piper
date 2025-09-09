export const demoInterviewData  = {
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
