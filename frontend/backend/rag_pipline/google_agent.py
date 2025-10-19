from langchain.agents import create_agent
from dotenv import load_dotenv
from backend.rag_pipline.tools import rag_search_tool
load_dotenv()


class GoogleAgent:
    def __init__(self,):
        self.agent = None
        
    def get_agent(self):
        if self.agent is None:
            self.agent = create_agent(
                "google_genai:gemini-2.0-flash",
                tools=[rag_search_tool],
                system_prompt="""You are an assistant for question-answering tasks. the args are given below:
                Use the following pieces of retrieved context to answer the question. If you don't know the answer
                The rag_search_tool takes a query string as an argument."""
            )
        return self.agent
    
    def query(self, query: str):
        
        agent = self.get_agent()
        return agent.invoke({"messages": [{"role": "user", "content": query}]})