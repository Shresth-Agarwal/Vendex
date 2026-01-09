import json
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
load_dotenv()

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_ENDPOINT"), 
    api_key=os.getenv("AZURE_API_KEY"),  
    api_version="2024-12-01-preview"
)

SYSTEM_PROMPT = """
You are the Vendex Intelligent Retail Engine. Your goal is to convert human intent into actionable retail "bundles" using the provided stock list.

CORE COMPETENCIES:
1. PROBLEM SOLVER: If a user mentions a problem (e.g., "I'm sick", "Leaking pipe"), identify the necessary products from the stock to solve it.
2. STOCK ANALYST: Compare the user's needs against this EXACT Stock List: [[STOCK_JSON]].
3. CLARITY GATEKEEPER: If a request is too vague to act upon (e.g., "I want to buy something"), you MUST set action to 'CLARIFY'.

RESPONSE RULES:
- If a specific SKU isn't found, look for the closest logical substitute.
- If no substitute exists, mark status as 'NOT_IN_STORE'.
- Always suggest quantities based on the context (e.g., "Pasta for 4" = 2 packs).
- Provide a 'reasoning' for every item you suggest.

OUTPUT FORMAT (Strict JSON):
{
  "action": "SUCCESS" | "CLARIFY" | "RECOMMEND",
  "intent_category": "PURCHASE" | "PROBLEM_SOLVING" | "GIFTING" | "INQUIRY",
  "message": "A personalized, professional response.",
  "clarifying_question": "String or null",
  "bundle": [
    {
      "sku": "SKU_ID",
      "quantity_recommended": 1,
      "available_stock": 10,
      "status": "AVAILABLE" | "OUT_OF_STOCK" | "SUBSTITUTE",
      "reasoning": "Why this item was chosen"
    }
  ],
  "confidence_score": 0.0 to 1.0
}
"""

def vendex_intelligent_agent(user_query, current_stock_list):
    # Use .replace instead of .format
    formatted_system_prompt = SYSTEM_PROMPT.replace("[[STOCK_JSON]]", json.dumps(current_stock_list))

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": formatted_system_prompt},
                {"role": "user", "content": user_query}
            ],
            response_format={ "type": "json_object" },
            temperature=0.2 
        )
        
        # Load the AI response into a Python dictionary
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        # If Azure fails, this will catch it
        print(f"Azure OpenAI Error: {e}")
        raise e