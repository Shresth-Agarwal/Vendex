import json
import os
from dotenv import load_dotenv
from .ai_config import ai_chat

load_dotenv()

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
    formatted_system_prompt = SYSTEM_PROMPT.replace("[[STOCK_JSON]]", json.dumps(current_stock_list))

    try:
        content = ai_chat([
            {"role": "system", "content": formatted_system_prompt},
            {"role": "user", "content": user_query}
        ], temperature=0.2)

        # Extract JSON from response (handle markdown code blocks)
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"AI Error: {e}")
        raise e
