from langchain.agents import create_agent
from pipeline_for_docement_ingestion.docsProcessing import DocsProcessor
import os
from langchain.tools import tool

@tool("rag_search_tool", description="Useful for answering questions about financial documents based on their content.")   
def rag_search_tool(query: str) -> str:
    results = DocsProcessor().search_documents(query, k=2)    
    return results