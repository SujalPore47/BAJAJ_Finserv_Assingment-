#!/usr/bin/env bash
set -euo pipefail

python -m pip install --upgrade pip

# Install known-conflicting packages without their declared dependencies
python -m pip install --no-deps \
  google-generativeai \
  google-ai-generativelanguage \
  langchain-google-genai

python -m pip install --no-deps \
  langchain \
  langchain-core \
  langchain-qdrant \
  langgraph \
  langgraph-checkpoint \
  langgraph-prebuilt \
  langgraph-sdk \
  langsmith

# Install the remainder of the requirements file without dependency resolution
python -m pip install --no-cache-dir --no-deps -r requirements.txt
