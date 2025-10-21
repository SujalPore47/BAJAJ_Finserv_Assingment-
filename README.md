# 🧠 Bajaj Finserv AMC RAG Chatbot

🔗 **Live Demo:** [bajaj-finserv-assingment.vercel.app](https://bajaj-finserv-assingment.vercel.app)

---

## 🧩 Overview

This project is a **Retrieval-Augmented Generation (RAG)** chatbot built to answer complex questions about **Bajaj AMC Fund Factsheets**.
It combines **document intelligence**, **image-to-text understanding**, and **contextual reasoning** using **Gemini**, **LangChain**, and **Qdrant VectorDB**.

---

## 🧠 System Architecture

Below is the complete system workflow:

<img src="ArchitectureDiagram.png" alt="System Architecture" width="100%"/>

*(The diagram showcases document ingestion, vectorization, RAG retrieval, and Gemini-powered reasoning.)*

---

## ⚙️ Data Ingestion Pipeline

When a user uploads a **factsheet PDF**, here’s what happens behind the scenes:

1. 📤 The **document** is uploaded to the `/upload` endpoint.
2. 🧾 It is **converted from PDF → Image** using `PyMuPDF`.
3. 🧠 Each page image is sent to **Gemini-2.0-Flash-Lite (Vision model)** instead of a traditional OCR system.
4. 🧩 The model extracts **text, tables, charts, and visuals** directly from the image.

### 🔍 Why Gemini over OCR?

| Aspect                        | Gemini Vision Model                                 | Traditional OCR                 |
| :---------------------------- | :-------------------------------------------------- | :------------------------------ |
| **Accuracy on charts/tables** | High — understands layout & semantic meaning        | Poor — extracts plain text only |
| **Multi-modal reasoning**     | Can interpret visual context (like graphs or icons) | Text only                       |
| **Setup**                     | Requires API access                                 | Simple                          |
| **Cost & latency**            | Slightly higher                                     | Lower                           |
| **Best use**                  | Rich, mixed media documents                         | Pure text scans                 |

5. 🧠 After textual + visual info extraction, data is **split & chunked**.
6. 📚 The **Gemini embedding model** converts each chunk to a **vector representation**.
7. 🧩 The data is stored in **Qdrant DB** using its Python client (`qdrant-client`).

---

## 💬 Chat Pipeline (Backend RAG Flow)

When a user queries the chatbot:

1. The query is sent to the **AI Agent (Gemini-2.5-Flash)**.
2. The agent analyses the intent and decides **whether to use the RAG tool** (retrieval) or respond directly.
3. If retrieval is needed, the **MMR (Maximal Marginal Relevance)** search strategy is used to query Qdrant DB.
4. Retrieved context is appended to the prompt and passed to Gemini for response generation.
5. The chatbot responds with an answer grounded in the retrieved context.
6. In the UI, users can click the **three dots (`...`)** under each message bubble to **view the retrieved context** used by the model — ensuring full transparency.

---

## 🧱 Tech Stack

| Layer               | Tools & Libraries                                                                        |
| :------------------ | :--------------------------------------------------------------------------------------- |
| **Backend**         | FastAPI, LangChain, Google Generative AI (`google-generativeai`), Qdrant Client, PyMuPDF |
| **Frontend**        | Next.js, React, Tailwind CSS, Lucide Icons                                               |
| **AI Models**       | Gemini-2.0-Flash-Lite (Vision), Gemini-2.5-Flash (Text), Gemini Embedding Model          |
| **Database**        | Qdrant Vector Database                                                                   |
| **Search Strategy** | Maximal Marginal Relevance (MMR)                                                         |

---

## 🔐 Environment Configuration

To run the app, create a `.env` file in both **backend** and **frontend** directories with the following:

```bash
GOOGLE_API_KEY=your_google_api_key_here
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_API_KEY_LOCATION=your_qdrant_cluster_url
TAVILY_API_KEY=your_tavily_api_key_here
COLLECTION_NAME=your_qdrant_collection_name_here
```

⚠️ **These API keys are mandatory** for document ingestion, RAG retrieval, and chat functionality.

---

## 📂 Project Structure

```
├── backend/
│   ├── main.py
│   ├── .env
│   ├── requirements.txt
│   ├── pipeline_for_document_ingestion/
│   │   └── docsProcessing.py
│   └── rag_pipeline/
│       ├── google_agent.py
│       └── tools.py
├── frontend/
│   ├── next.config.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   ├── layout.tsx
│   │   ├── context/
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── UploadContext.tsx
│   │   └── components/
│   │       ├── Notification.tsx
│   │       ├── ChatContainer.tsx
│   │       └── ContextViewer.tsx
└── scripts/
```

---

## ▶️ Running the Application

### **Backend**

```bash
cd backend
uvicorn main:app --reload
```

### **Frontend**

```bash
cd frontend
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**.

---

## 🌗 Frontend Features

* 🌙 Dark/Light Mode toggle
* 🧾 File upload with real-time feedback
* 💬 Context transparency (click `...` to view AI context)
* ⚡ Smooth transitions with Lucide icons & Tailwind

---

## 🌐 Deployment

| Component     | Platform              |
| :------------ | :-------------------- |
| **Frontend**  | Vercel                |
| **Backend**   | FastAPI (Local/Cloud) |
| **Vector DB** | Qdrant Cloud          |

🔗 **Live App:** [bajaj-finserv-assingment.vercel.app](https://bajaj-finserv-assingment.vercel.app)

---

## 🧩 Future Enhancements

* Support multiple PDF ingestion and cross-document context merging.
* Domain-adaptive embeddings for AMC-specific finance data.
* Semantic cache for repeated user queries.

---

## 👤 Author

**Sujal Pore**
🔗 [GitHub](https://github.com/SujalPore47)
💬 Always open to collaboration, ideas, or optimizations!

---
