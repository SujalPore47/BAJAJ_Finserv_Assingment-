from langchain.agents import create_agent
from pipeline_for_docement_ingestion.docsProcessing import DocsProcessor
import os
from langchain.tools import tool
from dotenv import load_dotenv
from tavily import TavilyClient
load_dotenv()

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool("rag_search_tool", description="Useful for answering questions about financial documents based on their content.")   
def rag_search_tool(query: str) -> str:
    results = DocsProcessor().search_documents(query, k=6)    
    return results

@tool("web_search_tool", description="Useful for answering questions by searching the web for up-to-date information.")   
def web_search_tool(query: str) -> dict:
    search_results = tavily_client.search(query=query, include_answer="basic",country="india",max_results=3)
    return search_results

