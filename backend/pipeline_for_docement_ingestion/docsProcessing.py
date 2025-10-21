import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import json
import fitz  # PyMuPDF
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client.models import Distance, VectorParams
from langchain_qdrant import Qdrant
from qdrant_client import QdrantClient
from langchain_core.documents import Document
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

class DocsProcessor:
    def __init__(self):
        logging.info("Initializing DocsProcessor...")
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite", generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        self.client = QdrantClient(api_key=os.getenv("QUADRANT_API_KEY"), url=os.getenv("QUADRANT_API_KEY_LOCATION"))
        self.collection_name = "BAJAJ_FINANCIAL_REPORT_TEST"
        self.client.get_collection(self.collection_name)
        self.vector_store = Qdrant(self.client, self.collection_name, self.embeddings)
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=3000,chunk_overlap=100)
        logging.info("Vector store initialized.")
        self.prompt = """You are an advanced financial document processing OCR system. 
            Your task is to extract **all textual content from the provided document**, preserving **every single detail**. This includes:

            - Section headings, subheadings, and hierarchy
            - Paragraphs and lists
            - All numeric values (revenues, profits, percentages, ratios, etc.)
            - Tables (as text, preserving structure and data)
            - Charts or figures (described as text, with all labels and numbers)
            - Footnotes, annotations, disclaimers, and captions
            - Any other content present in the document

            Do not omit, summarize, or interpret any information. Preserve the formatting and hierarchy as much as possible to maintain clarity and readability.

            Your output must be in **exact JSON format**:

            {{
            "text": "<comprehensive_extracted_text_with_every_detail_present,_including_tables,_charts,_footnotes,_and_numbers,_formatted_for_readability>",
            "summary": "<extremely_concise_summary_of_the_document,_suitable_for_vectorstore_metadata,_e.g._'Annual financial report FY2024,_balance_sheet_and_profit_analysis'>"
            }}

            Guidelines:

            1. **Include everything:** Every detail in the document must appear in the `text` field.  
            2. **Maintain structure:** Keep headings, subheadings, lists, and table formatting clear.  
            3. **Tables & charts:** Convert them to readable text; include all numbers, labels, and notes.  
            4. **Footnotes & disclaimers:** Include all notes exactly as in the document.  
            5. **Summary:** One short sentence or key phrase capturing the main topic for metadata purposes.  
            6. **Do not skip, compress, or ignore any content.** Only format it cleanly for readability.
            """

    def process_document(self, image_bytes):
        logging.info("Processing document...")
        try:
            image = Image.open(BytesIO(image_bytes))
            image_format = image.format.lower()
            
            if image_format not in ["png", "jpeg", "jpg", "gif", "bmp"]:
                raise ValueError(f"Unsupported image format: {image_format}")

            mime_type = f"image/{image_format}"
            
            image_part = {
                "mime_type": mime_type,
                "data": image_bytes
            }

            response = self.model.generate_content([self.prompt, image_part])
            logging.info("Document processing successful.")
            return json.loads(response.text)
        except Exception as e:
            logging.error(f"An error occurred during document processing: {e}")
            return {"text": "ERROR PROCESSING THE PAGE", "summary": "NULL"}
            

    def process_image(self, image):
        logging.info("Processing image...")
        try:
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            response_data = self.process_document(img_byte_arr)
            self.add_documents(response_data['text'], response_data['summary'])
            logging.info(f"Image processing successful")
            return response_data
        except Exception as e:
            logging.error(f"An error occurred during image processing: {e}")
            raise

    def convert_pdf_to_images(self, file_content):
        logging.info("Converting PDF to images...")
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            images = []
            for page in doc:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                images.append(img)
            logging.info(f"Converted {len(images)} pages from PDF.")
            return images
        except Exception as e:
            logging.error(f"An error occurred during PDF to image conversion: {e}")
            raise
    
    def add_documents(self, text, summary):
        logging.info("Adding document to vector store...")
        try:
            document = Document(page_content=text, metadata={"summary": summary})
            document_chunks = self.text_splitter.split_documents([document])
            for docs in document_chunks:
                try:
                    self.vector_store.add_documents([docs])
                    logging.info("Document added to vector store successfully.")
                except Exception as e:
                    logging.error(f"Failed to add document chunk to vector store: {e}")
                    continue
        except Exception as e:
            logging.error(f"An error occurred while adding document to vector store: {e}")
            return "ERROR ADDING DOCUMENT TO VECTOR STORE BECAUSE THE CONTEXT TOO LARGE" 
    
    def search_documents(self, query, k=6):
        logging.info(f"Searching documents for query: {query}")
        try:
            retriever = self.vector_store.as_retriever(search_type="mmr", search_kwargs={"k": k})
            results = retriever.invoke(query)
            joined_text = "\n\n".join(doc.page_content for doc in results)
            logging.info(f"Search successful, found documents.")
            return joined_text
        except Exception as e:
            logging.error(f"An error occurred during document search: {e}")
            raise