# syntax=docker/dockerfile:1.7

ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim AS base

ENV POETRY_VIRTUALENVS_CREATE=false \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required by scanner/ML libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmagic1 \
    libpoppler-cpp-dev \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    libtesseract-dev \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --upgrade pip \
 && python -m pip install --no-deps \
      google-generativeai \
      google-ai-generativelanguage \
      langchain-google-genai \
      langchain \
      langchain-core \
      langchain-qdrant \
      langgraph \
      langgraph-checkpoint \
      langgraph-prebuilt \
      langgraph-sdk \
      langsmith \
 && python -m pip install --no-cache-dir --no-deps -r requirements.txt

FROM base AS final

WORKDIR /app

COPY . /app/backend
ENV PYTHONPATH="/app"

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
