"""
An agent to create questions bases on chosen tech stack.
"""



import os
import uuid
from dotenv import load_dotenv
load_dotenv()

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import FileChatMessageHistory
# Initialize the LLM
llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.0,
    max_retries=2,
)

# In-memory store (you can replace this with a dict that loads/saves to file/DB for persistence)
store = {}

def get_history(session_id):
    return FileChatMessageHistory(f"{session_id}.json")

with_message_history = RunnableWithMessageHistory(
    llm,
    get_history,
    # input_messages_key="messages",
    # history_messages_key="messages",
)


def ask_question(session_id, question):
    response = with_message_history.invoke(
        [HumanMessage(content=question)],
        config={"configurable": {"session_id": session_id}},
    )
    return response


def main():
    session_id = "2"
    while True:
        question = input("Ask a question (or type 'exit' to quit): ")
        if question.lower() == "exit":
            break
        response = ask_question(session_id, question)
        print("Response:")
        print(response.content)
        print("\n") 

if __name__ == "__main__":
    main()
