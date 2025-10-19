import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
# from concurrent.futures import ThreadPoolExecutor
from pipeline_for_docement_ingestion.docsProcessing import DocsProcessor
from rag_pipline.google_agent import GoogleAgent
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
]

vercel_host = os.getenv("VERCEL", "bajaj-finserv-assingment.vercel.app")
allowed_origins.extend(
    [
        f"https://{vercel_host}",
        f"https://*.{vercel_host}",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

doc_processor = None
google_agent = None

@app.on_event("startup")
async def startup_event():
    global doc_processor, google_agent
    if not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY environment variable not set.")
    doc_processor = DocsProcessor()
    google_agent = GoogleAgent()

@app.get("/")
async def root():
    return {"message": "Bajaj Finserv RAG Chatbot API is running."}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), pages_to_process: int = Query(None)):
    """
    Accepts a file upload (PDF or image), processes it to extract text,
    and returns the extracted text in JSON format.
    """
    file_extension = file.filename.split(".")[-1].lower()
    file_content = await file.read()

    if file_extension == "pdf":
        try:
            images = doc_processor.convert_pdf_to_images(file_content)
            
            if pages_to_process is not None:
                images = images[:pages_to_process]

            extracted_text = []
            for image in images:
                extracted_text.append(doc_processor.process_image(image))
            
            # with ThreadPoolExecutor() as executor:
            #     extracted_text = list(executor.map(doc_processor.process_image, images))
            
            return {"filename": file.filename, "content": extracted_text}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while processing the PDF: {e}")

    elif file_extension in ["png", "jpg", "jpeg", "gif", "bmp"]:
        try:
            response_text = doc_processor.process_document(file_content)
            extracted_data = json.loads(response_text)
            return {"filename": file.filename, "content": [extracted_data]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while processing the image: {e}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or an image file.")

class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
async def chat(request: ChatRequest):
    if google_agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized.")
    try:
        response = google_agent.query(request.question)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
