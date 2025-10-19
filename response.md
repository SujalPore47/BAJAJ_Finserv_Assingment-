**Normal response without using any tools**
```json
{
  "messages": [
    {
      "content": "hi",
      "additional_kwargs": {},
      "response_metadata": {},
      "type": "human",
      "name": null,
      "id": "3d7e1449-9cb5-4717-b9b9-654fc7bb1c55"
    },
    {
      "content": "Hi, how can I help you today?",
      "additional_kwargs": {},
      "response_metadata": {
        "prompt_feedback": {
          "block_reason": 0,
          "safety_ratings": []
        },
        "finish_reason": "STOP",
        "model_name": "gemini-2.0-flash",
        "safety_ratings": [],
        "grounding_metadata": {},
        "model_provider": "google_genai"
      },
      "type": "ai",
      "name": null,
      "id": "lc_run--ad47ac5d-3c4d-4c1a-94ed-62debe6140eb-0",
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 77,
        "output_tokens": 10,
        "total_tokens": 87,
        "input_token_details": {
          "cache_read": 0
        }
      }
    }
  ]
}
```
**response with tools**
```json
{
  "messages": [
    {
      "content": "hi tell me about bajaj",
      "additional_kwargs": {},
      "response_metadata": {},
      "type": "human",
      "name": null,
      "id": "ed6b9fde-dd70-4ba7-bf7e-23ad1e922fdc"
    },
    {
      "content": "",
      "additional_kwargs": {
        "function_call": {
          "name": "rag_search_tool",
          "arguments": "{\"query\": \"bajaj\"}"
        }
      },
      "response_metadata": {
        "prompt_feedback": {
          "block_reason": 0,
          "safety_ratings": []
        },
        "finish_reason": "STOP",
        "model_name": "gemini-2.0-flash",
        "safety_ratings": [],
        "grounding_metadata": {},
        "model_provider": "google_genai"
      },
      "type": "ai",
      "name": null,
      "id": "lc_run--42f049b8-1e4d-461b-9fb6-7b9e545e427b-0",
      "tool_calls": [
        {
          "name": "rag_search_tool",
          "args": {
            "query": "bajaj"
          },
          "id": "0bac959b-2182-4ea7-be3c-a70e32669b4d",
          "type": "tool_call"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 82,
        "output_tokens": 8,
        "total_tokens": 90,
        "input_token_details": {
          "cache_read": 0
        }
      }
    },
    {
      "content": "B\nFINSERV\nBAJAJ\nWEALTH CREATION KA\nSABSE INTELLIGENT PLAN\nSTART YOUR JOURNEY WITH\nA SYSTEMATIC INVESTMENT PLAN TODAY.\nFACTSHEET, OCTOBER 24\nMutual Fund investments are subject to market risks, read all scheme related documents carefully.\nBAJAJ FINSERV ASSET MANAGEMENT LIMITED",
      "additional_kwargs": {},
      "response_metadata": {},
      "type": "tool",
      "name": "rag_search_tool",
      "id": "bd9872a1-d0dc-4026-88ac-2ad7bf4ce57d",
      "tool_call_id": "0bac959b-2182-4ea7-be3c-a70e32669b4d",
      "artifact": null,
      "status": "success"
    },
    {
      "content": "According to the factsheet, Bajaj Finserv Asset Management Limited offers wealth creation plans through systematic investment plans. Mutual Fund investments are subject to market risks, so it's important to read all scheme-related documents carefully.",
      "additional_kwargs": {},
      "response_metadata": {
        "prompt_feedback": {
          "block_reason": 0,
          "safety_ratings": []
        },
        "finish_reason": "STOP",
        "model_name": "gemini-2.0-flash",
        "safety_ratings": [],
        "grounding_metadata": {},
        "model_provider": "google_genai"
      },
      "type": "ai",
      "name": null,
      "id": "lc_run--ee118fff-6523-4472-b001-e2905b9a8258-0",
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 167,
        "output_tokens": 45,
        "total_tokens": 212,
        "input_token_details": {
          "cache_read": 0
        }
      }
    }
  ]
}
```