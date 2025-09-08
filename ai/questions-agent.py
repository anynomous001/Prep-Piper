"""
An agent to create questions based on chosen tech stack.
"""

import os
import uuid
from dotenv import load_dotenv
load_dotenv()

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
# os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")


from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import FileChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

llm = ChatGroq(
model="moonshotai/kimi-k2-instruct",
temperature=0.3,
max_retries=2
)
# llm = ChatOpenAI(
# model="gpt-3.5-turbo-0125",
# temperature=0.3,
# max_retries=2
# )

# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash",
#     temperature=0.3,
#     max_retries=2,
# )

interview_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system", """
            You are an experienced technical interviewer conducting a interview for a {position} role.

            You will ask maximum 5 questions around candidate's preferred tech stack : {tech_stack}

            Your role as an interviewer:
            1. Ask ONE question at a time and wait for candidates response
            2. Start with Basics and graudally increase difficulty
            3. Ask follow-up questions based on candidates previous response
            4. Probe deeper when answerd are imcomplete or need more clarification
            5. Cover both theorotical knowledge or practicle implementation,
            6. Ask about real world probllem scenarios and their probable solutions
            7. Be encouraging through your questionning
            8. Keep track of covered topics and explore uncovered topics

            Interview Guidelines:
            - Begin with warm introduction and basic questioning
            - Progress through: basics → intermediate → advanced (only if they show competency)
            - If candidate struggles with basics, stay at that level and provide guidance
            - Adapt questions based on demonstrated knowledge level
            - When candidate says "I don't know", offer hints or redirect to related simpler topics
            - Keep questions focused and specific
            - Maintain an empathetic, professional, and encouraging tone
            - Always reference their previous response to show you're listening


            Examples:
            -----------------------------------------------------------------------
            
            
            Example One : 

            [System]
            Hi, thanks for joining today’s interview. Since you have experience with Next.js, Node.js, and PostgreSQL, let’s start with something simple —  
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


            Current interview session : Focus on {tech_stack} technologies
            Interview Style : Professional, emphathatic, encouraging and thorough  

            Remember : You are evaluating technical competency, problem solving skilss and in depth understaning of chosen tech stack.
            """

        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)


def get_history(session_id)->FileChatMessageHistory:
    return FileChatMessageHistory(f"interviews/{session_id}.json")


os.makedirs("interviews",exist_ok=True )

class TechInterviewer:
    def __init__(self):
        self.llm = llm
        self.session_data={}



    def start_interview(self,tech_stack:str,position:str='Software Developer'):
        """ Start an interview session with tech stack and position"""

        session_id = uuid.uuid4().hex

        self.session_data[session_id]={
            "tech_stack":tech_stack,
            "position" : position,
            "current_question_index": 0,        # << TRACK PROGRESS
            "questions": [], 
            "questions_asked":0,
            "difficulty_level": " beginner"
        }
        interview_chain = interview_prompt | self.llm

        with_message_history = RunnableWithMessageHistory(
            interview_chain,
            get_history,
            input_messages_key="messages",
            history_messages_key="messages"
        )

        self.session_data[session_id]["interview_chain"] = with_message_history

         # Start the interview
        initial_message = f"""Hello! 
        I'm prep piper your ai interviewer,

        I'm conducting a technical interview for a {position} position. 
                            I see your tech stack includes: {tech_stack}
                            Let's begin with some fundamental questions. Don't worry, we'll start simple and gradually progress.
                            First question: Can you briefly introduce yourself and tell me about your experience with {tech_stack.split(',')[0].strip()}?"""

        print("\n" + "="*80)
        print(f"🎯 TECHNICAL INTERVIEW STARTED")
        print(f"📋 Position: {position}")
        print(f"🛠️  Tech Stack: {tech_stack}")
        print("="*80)
        print(f"\n🎤 Interviewer: {initial_message}")
        
        return session_id, with_message_history


    def ask_question(self,session_id, with_message_history,answer):
        """Process candidate's answer and ask a follow-up question. """

        if session_id not in self.session_data:
            return "Session not found! Please start an interview first."

        session_info = self.session_data[session_id]


        with_message_history = session_info["interview_chain"]
        
        # Don't proceed if answer is too short or generic
        if not answer or len(answer.strip()) < 2:
            return "I'd love to hear more from you! Please share your thoughts or let me know if you need clarification on the question." 

        try:
            response = with_message_history.invoke(
                {
                    "messages": [HumanMessage(content=answer)],
                    "tech_stack": session_info["tech_stack"],
                    "position":session_info["position"]
                },
                config={"configurable": {"session_id": session_id}},
            )
            session_info["questions_asked"] += 1
            session_info["current_question_index"] += 1

            session_info["questions"].append(response.content)

            if session_info["questions_asked"] >= 5:
                return "🏁 That's all for now! Type 'summary' to see a recap, or 'exit' to finish."
            return response.content
        except Exception as e:
            return f"An error occurred during interview : {str(e)}"
            
    def get_session_summary(self,session_id):
        """ Get interview session summary"""

        if session_id not in self.session_data:
            return "Session not found! Please start an interview first."

        session_info = self.session_data[session_id]

        return f"""
            📊 INTERVIEW SESSION SUMMARY
            Session ID: {session_id}
            Position: {session_info['position']}
            Tech Stack: {session_info['tech_stack']}
            Questions Asked: {session_info['questions_asked']}
            """




def main():
    interviewer = TechInterviewer()

    print("🎯 Welcome to the Tech Stack Interview Simulator!")
    print("This AI will conduct a technical interview based on your chosen tech stack.\n")
    
    # Get interview setup from user
    print("📝 Interview Setup:")
    tech_stack = input("Enter your tech stack (comma-separated): ").strip()
    if not tech_stack:
        tech_stack = "Python, JavaScript, React"
        print(f"Using default: {tech_stack}")
    
    position = input("Enter the position you're interviewing for (default: Software Developer): ").strip()
    if not position:
        position = "Software Developer"

    # Start interview
    session_id, with_message_history = interviewer.start_interview(tech_stack, position)
    
    print("\n💡 Tips:")
    print("- Answer thoroughly but concisely")
    print("- Ask for clarification if needed")
    print("- Type 'exit' to end the interview")
    print("- Type 'summary' to see session info")
    print("-" * 50)
    
    # Interview loop
    while True:
        print("\n" + "-" * 50)
        answer = input("\n👤 Your Answer: ").strip()
        
        if answer.lower() == 'exit':
            print("\n🏁 Interview Ended")
            print(interviewer.get_session_summary(session_id))
            print("\nThank you for participating! Your interview has been saved.")
            break
        elif answer.lower() == 'summary':
            print(interviewer.get_session_summary(session_id))
            continue
        elif not answer:
            print("Please provide an answer or type 'exit' to end the interview.")
            continue
        
        # Get next question from interviewer
        try:
            next_question = interviewer.ask_question(session_id, with_message_history, answer)
            print(f"\n🎤 Interviewer: {next_question}")
            
        except KeyboardInterrupt:
            print("\n\n🏁 Interview interrupted")
            print(interviewer.get_session_summary(session_id))
            break
        except Exception as e:
            print(f"\n🚨 Error: {e}")
            print("Please try again or type 'exit' to end the interview.")

if __name__ == "__main__":
    main()
