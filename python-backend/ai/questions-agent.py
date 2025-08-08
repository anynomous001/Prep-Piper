"""
An agent to create questions based on chosen tech stack.
"""

import os
import uuid
from dotenv import load_dotenv
load_dotenv()

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import FileChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.3,
    max_retries=2,
)

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
            - Begin With a warm introduction and basic questioning
            - Progress through: basics - intermidiate - advanced 
            - Ask about code optimization, best practices and 
            - any problems candidate has solved, ask about their experience
            - Adapt your questions based on the candidate's experience level shown in their answers
            - If a candidate struggles offer hints or redirect to related topics
            - Keep questions focused and specific to avoid overwhelming the candidate
            - Keep a emphathatically professional tone

            Current interview session : Focus on {tech_stack} technologies
            Interview Style : Professional, emphathatic, encouraging and thorough  

            Remember : You are evaluating technical competency, problem solving skilss and in depth understaning of chosen tech stack.
            """

        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)


def get_history(session_id)->FileChatMessageHistory:
    return FileChatMessageHistory(f"{session_id}.json")

with_message_history = RunnableWithMessageHistory(
    llm,
    get_history,
)

def ask_question(session_id, question):
    response = with_message_history.invoke(
        {"messages": [HumanMessage(content=question)]},
        config={"configurable": {"session_id": session_id}},
    )
    return response

def main():
    session_id = uuid.uuid4().hex 
    while True:
        question = input("Ask a question (or type 'exit' to quit): ")
        if question.lower() == "exit":
            break
        response: BaseMessage = ask_question(session_id, question)
        
        print("Response:")
        print(response)
        print(f"[{response.type.upper()}] {response.content}\n")

if __name__ == "__main__":
    main()
