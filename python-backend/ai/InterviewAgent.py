"""
A simplified and robust technical interview agent with enhanced error handling.
"""

import os
import uuid
import json
import sys

def check_dependencies():
    """Check if required packages are installed"""
    missing_packages = []
    
    try:
        from dotenv import load_dotenv
        print("✓ python-dotenv found")
    except ImportError:
        missing_packages.append("python-dotenv")
    
    try:
        from langchain_groq import ChatGroq
        print("✓ langchain-groq found")
    except ImportError:
        missing_packages.append("langchain-groq")
    
    try:
        from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
        print("✓ langchain-core found")
    except ImportError:
        missing_packages.append("langchain-core")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("\nInstall with:")
        for pkg in missing_packages:
            print(f"  pip install {pkg}")
        return False
    
    print("✓ All dependencies found")
    return True

def load_environment():
    """Load and validate environment variables"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            print("❌ GROQ_API_KEY not found in environment")
            print("Please add GROQ_API_KEY to your .env file")
            return False
        
        print("✓ Environment variables loaded")
        return True
    except Exception as e:
        print(f"❌ Error loading environment: {e}")
        return False

class TechInterviewer:
    def __init__(self):
        self.sessions = {}
        self.max_questions = 5
        self.llm = None
        
        # Initialize LLM with error handling
        try:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                model="moonshotai/kimi-k2-instruct",
                temperature=0.3,
                max_retries=2
            )
            print("✓ LLM initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing LLM: {e}")
            raise

    def start_interview(self, tech_stack="Python, JavaScript, React", position="Software Developer"):
        """Start a new interview session"""
        try:
            session_id = uuid.uuid4().hex[:8]
            
            self.sessions[session_id] = {
                "tech_stack": tech_stack,
                "position": position,
                "question_count": 0,
                "difficulty": "beginner",
                "conversation_history": [],
                "is_complete": False
            }
            
            first_tech = tech_stack.split(',')[0].strip()
            initial_message = f"""Hello! I'm your AI interviewer for today's {position} interview.

I see your tech stack includes: {tech_stack}

Let's start with something fundamental. Can you explain what {first_tech} is and describe one project where you've used it effectively?"""

            self.sessions[session_id]["conversation_history"].append({
                "role": "interviewer", 
                "content": initial_message
            })
            
            return session_id, initial_message
            
        except Exception as e:
            print(f"❌ Error starting interview: {e}")
            return None, f"Error: {e}"

    def process_answer(self, session_id, answer):
        """Process candidate answer and generate next question"""
        try:
            if session_id not in self.sessions:
                return "❌ Session not found! Please start a new interview."
            
            session = self.sessions[session_id]
            
            if session["is_complete"]:
                return "✅ Interview already completed! Type 'summary' for recap."
            
            # Validate answer
            if not answer or len(answer.strip()) < 3:
                return "🤔 I'd like to hear more from you. Please share your thoughts or ask for clarification if needed."
            
            # Add candidate's answer to history
            session["conversation_history"].append({
                "role": "candidate", 
                "content": answer
            })
            
            # Increment question count
            session["question_count"] += 1
            
            # Check if interview should end
            if session["question_count"] >= self.max_questions:
                session["is_complete"] = True
                return self._generate_completion_message(session_id)
            
            # Generate next question using simple prompting
            next_question = self._generate_next_question(session_id)
            
            session["conversation_history"].append({
                "role": "interviewer", 
                "content": next_question
            })
            
            return next_question
            
        except Exception as e:
            print(f"❌ Error processing answer: {e}")
            return f"Error processing your answer: {e}"

    def _generate_next_question(self, session_id):
        """Generate the next interview question"""
        try:
            session = self.sessions[session_id]
            
            # Create conversation context
            recent_conversation = ""
            for msg in session["conversation_history"][-4:]:
                recent_conversation += f"{msg['role'].title()}: {msg['content']}\n\n"
            
            # Create system prompt
            system_content = f"""You are a technical interviewer for a {session['position']} role.

            INTERVIEW CONTEXT:
            - Tech Stack: {session['tech_stack']}
            - Question Number: {session['question_count'] + 1} of {self.max_questions}
            - Current Level: {session['difficulty']}

            RECENT CONVERSATION:
            {recent_conversation}

            Your role as an interviewer:  
            1. Ask ONE question at a time and wait for candidates response
            2. Start with Basics and graudally increase difficulty
            3. Ask follow-up questions based on candidates previous response
            4. Probe deeper when answerd are imcomplete or need more clarification
            5. Cover both theorotical knowledge or practicle implementation,
            6. Ask about real world probllem scenarios and their probable solutions
            7. Be encouraging through your questionning
            8. Keep track of covered topics and explore uncovered topics


            TASK: Generate the next interview question based on:
            1. The candidate's previous response
            2. Their demonstrated skill level
            3. The tech stack focus areas

            GUIDELINES:
            - Ask ONE clear, specific question
            - Adapt questions based on demonstrated knowledge level
            - When candidate says "I don't know", offer hints or redirect to related simpler topics
            - Keep questions focused and specific
            - Maintain an empathetic, professional, and encouraging tone
            - Always reference their previous response to show you're listening


             Example One : 

            [System]
            Since you have experience with Next.js, Node.js, and PostgreSQL, let’s start with something simple —  
            Can you explain how Next.js handles server-side rendering (SSR) and how it differs from static site generation (SSG)?

            [Candidate]
            SSR renders the page on each request at runtime, SSG builds it at build time...

            [System]
            That’s correct. In SSR, rendering happens per request, while SSG pre-builds pages.  
            Follow-up: If your SSR endpoint has heavy data fetching, how would you optimize the response time?

            [Candidate]
            I’d use caching, like Redis...

            [System]
            Good. Now moving deeper — Suppose you have a high-traffic app with a PostgreSQL database. You notice slow queries.  
            Walk me through a practical approach to identify and fix the issue.

            [Candidate]
            I’d start with EXPLAIN ANALYZE...

            [System]
            Great. Since you’ve shown strong fundamentals, let’s get more advanced:  
            If your Next.js app needed real-time data updates from PostgreSQL, how would you implement it efficiently?


            
            
            
            Example Two:

            [System]
            Welcome! Let’s start with the basics:  
            In Node.js, what’s the difference between synchronous and asynchronous operations?

            [Candidate]
            Async is non-blocking, sync is blocking...

            [System]
            That’s right. Can you give me an example in code where asynchronous processing would be essential?

            [Candidate]
            Maybe file reading...

            [System]
            Good. Let’s move forward — In MongoDB, how would you design a schema for storing user posts and comments?

            [Candidate]
            I’d use embedded documents for comments...

            [System]
            That’s a reasonable choice. Why embedded instead of referencing?

            [Candidate]
            Hmm... I’m not sure.

            [System]
            That’s okay. Embedding reduces the need for joins, but can increase document size.  
            Now, suppose you need to fetch posts along with comments but also filter by recent comments. How would you query that in MongoDB?


            
            
            Example Three:

            [System]
            Hi, let’s start easy:  
            What is the difference between a class component and a functional component in React?

            [Candidate]
            I don’t know...

            [System]
            No problem — Class components are older, use `this.state`, while functional ones use hooks like `useState`.  
            Can you tell me what a React hook is?

            [Candidate]
            Is it like a function?

            [System]
            Yes, it’s a special function to manage state or lifecycle in functional components.  
            Here’s an example: `useEffect` runs code after rendering.  
            Now, can you give me a case where `useEffect` might be used?

            
            
            
            Example Four :

            [System]
            How would you configure a Kubernetes deployment to auto-scale based on CPU usage?

            [Candidate]
            I don’t know.

            [System]
            Alright, here’s a hint — Kubernetes has something called HPA. Do you know what HPA stands for?

            [Candidate]
            No.

            [System]
            It’s Horizontal Pod Autoscaler. It automatically adjusts pod count based on CPU/memory usage.  
            Let’s try something simpler: Can you tell me what a Kubernetes pod is?

            
            
            
            
            Example Five:

            [System]
            Can you explain how Spark processes data across a cluster?

            [Candidate]
            It splits data and processes it in parallel.

            [System]
            That’s a good start — Can you walk me through what happens after Spark splits the data? For example, how does it track progress or handle failures?

            [Candidate]
            Not sure.

            [System]
            No worries — Spark uses DAG scheduling, keeps track of transformations, and can recompute lost partitions from lineage.  
            Now, if one node fails mid-job, what happens?



            -----------------------------------------------------------------------


            Current interview session : Focus on {session['tech_stack']} technologies
            Interview Style : Professional, emphathatic, encouraging and thorough  

            Remember : You are evaluating technical competency, problem solving skilss and in depth understaning of chosen tech stack.

            Generate only the next question, nothing else."""

            from langchain_core.messages import SystemMessage, HumanMessage
            
            messages = [
                SystemMessage(content=system_content),
                HumanMessage(content="Generate the next interview question.")
            ]
            
            response = self.llm.invoke(messages)
            return response.content.strip()
            
        except Exception as e:
            print(f"❌ Error generating question: {e}")
            # Fallback questions based on progress
            fallback_questions = [
                f"Can you explain a key concept in {session['tech_stack'].split(',')[0].strip()}?",
                "How would you approach debugging a performance issue?",
                "Describe a challenging problem you solved recently.",
                "What best practices do you follow in your development process?",
                "How do you stay updated with new technologies?"
            ]
            return fallback_questions[min(session["question_count"], len(fallback_questions)-1)]

    def _generate_completion_message(self, session_id):
        """Generate interview completion message"""
        session = self.sessions[session_id]
        return f"""🏁 **Interview Complete!**

Thank you for participating in this {session['position']} interview!

📊 **Session Summary:**
- Questions Answered: {session['question_count']}/{self.max_questions}
- Tech Stack Covered: {session['tech_stack']}
- Final Difficulty: {session['difficulty'].title()}

Type 'summary' for detailed conversation history."""

    def get_summary(self, session_id):
        """Get detailed session summary"""
        if session_id not in self.sessions:
            return "❌ Session not found!"
        
        session = self.sessions[session_id]
        
        summary = f"""
📊 **DETAILED INTERVIEW SUMMARY**
═══════════════════════════════════════════════════════════════════

🆔 Session ID: {session_id}
📋 Position: {session['position']}
🛠️  Tech Stack: {session['tech_stack']}
❓ Questions: {session['question_count']}/{self.max_questions}
📈 Difficulty: {session['difficulty'].title()}
✅ Status: {'Complete' if session['is_complete'] else 'In Progress'}

📝 **FULL CONVERSATION:**
"""
        
        for i, msg in enumerate(session["conversation_history"], 1):
            role_emoji = "🎤" if msg["role"] == "interviewer" else "👤"
            summary += f"\n{i}. {role_emoji} {msg['role'].title()}:\n{msg['content']}\n{'-'*40}\n"
        
        return summary


def main():
    """Main function with comprehensive error handling"""
    try:
        print("🚀 Starting Prep Piper Interview Agent...")
        print("="*60)
        
        # Check dependencies
        print("\n📦 Checking dependencies...")
        if not check_dependencies():
            print("\n❌ Please install missing packages and try again.")
            return
        
        # Load environment
        print("\n🔧 Loading environment...")
        if not load_environment():
            print("\n❌ Please check your .env file and try again.")
            return
        
        # Initialize interviewer
        print("\n🤖 Initializing interviewer...")
        interviewer = TechInterviewer()
        
        print("\n🎯 Welcome to Prep Piper - Technical Interview Simulator!")
        print("This AI conducts structured technical interviews based on your tech stack.\n")
        
        # Get interview setup
        print("📝 Interview Setup:")
        tech_stack = input("Enter your tech stack (comma-separated, or press Enter for default): ").strip()
        if not tech_stack:
            tech_stack = "Python, JavaScript, React"
            print(f"Using default: {tech_stack}")
        
        position = input("Enter position (default: Software Developer): ").strip()
        if not position:
            position = "Software Developer"
        
        # Start interview
        print("\n🎬 Starting interview...")
        session_id, initial_message = interviewer.start_interview(tech_stack, position)
        
        if not session_id:
            print(f"❌ Failed to start interview: {initial_message}")
            return
        
        print("="*80)
        print(f"🎯 TECHNICAL INTERVIEW STARTED")
        print(f"📋 Position: {position}")
        print(f"🛠️  Tech Stack: {tech_stack}")
        print(f"🆔 Session ID: {session_id}")
        print("="*80)
        print(f"\n🎤 Interviewer: {initial_message}")
        
        print("\n💡 Commands: 'exit', 'summary', 'save'")
        print("-" * 80)
        
        # Main interview loop
        while True:
            print("\n" + "-" * 50)
            user_input = input("\n👤 Your Response: ").strip()
            
            if user_input.lower() == 'exit':
                print("\n🏁 Interview Ended")
                print(interviewer.get_summary(session_id))
                print("\nThank you for using Prep Piper!")
                break
                
            elif user_input.lower() == 'summary':
                print(interviewer.get_summary(session_id))
                continue
                
            elif user_input.lower() == 'save':
                # Simple save to file
                try:
                    os.makedirs("interviews", exist_ok=True)
                    filename = f"interviews/{session_id}.json"
                    with open(filename, 'w') as f:
                        json.dump(interviewer.sessions[session_id], f, indent=2)
                    print(f"✅ Session saved to {filename}")
                except Exception as e:
                    print(f"❌ Save error: {e}")
                continue
                
            elif not user_input:
                print("💭 Please provide an answer, or use 'exit', 'summary', or 'save' commands.")
                continue
            
            # Process the answer and get next question
            print("🔄 Processing your answer...")
            response = interviewer.process_answer(session_id, user_input)
            print(f"\n🎤 Interviewer: {response}")
            
    except KeyboardInterrupt:
        print("\n\n⏸️  Interview interrupted by user")
    except Exception as e:
        print(f"\n🚨 Critical error: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Add debug info
    print("🐍 Python version:", sys.version)
    print("📂 Current directory:", os.getcwd())
    print("📄 Script file:", __file__)
    print()
    
    try:
        main()
    except Exception as e:
        print(f"\n💥 Fatal error in main(): {e}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")