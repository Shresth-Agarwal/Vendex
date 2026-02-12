from dotenv import load_dotenv
import os
import json

import google.generativeai as genai

# Load env vars
load_dotenv()

GENAI_API_KEY = os.getenv("GENAI_API_KEY")

if not GENAI_API_KEY:
    raise RuntimeError("GENAI_API_KEY is not set. Please set it in your environment or .env file.")

# Configure client
genai.configure(api_key=GENAI_API_KEY)

MODEL_ID = "gemini-2.0-flash"

def ai_chat(messages, temperature=0.0):
    """
    Simple chat interface for AI models.
    messages: list of dicts with 'role' and 'content' keys
    temperature: controls randomness (0.0 = deterministic)
    Returns: response text
    """
    model = genai.GenerativeModel(MODEL_ID)
    
    # Format messages for the model
    full_prompt = ""
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        full_prompt += f"{role}: {content}\n"
    
    response = model.generate_content(full_prompt)
    return response.text
