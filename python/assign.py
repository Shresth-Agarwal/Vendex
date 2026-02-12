import json
import os
from dotenv import load_dotenv
from .ai_config import ai_chat
load_dotenv()


def assign_staff_to_shifts(input_data):
    """
    Receives shifts and staff from the backend and returns the assignment plan.
    """
    
    system_prompt = """
    You are the Vendex Staffing Coordinator Agent.
    
    TASK:
    Assign the most suitable staff member to each shift provided in the input.
    
    RULES:
    1. Skill Match: Prioritize staff who have the 'requiredSkill'.
    2. Availability: Only assign staff if the shift time falls within their 'availability' window for that specific day.
    3. Overtime: Avoid assigning staff if their 'hoursWorkedThisWeek' + shift duration exceeds 40 hours.
    4. Optimization: Try to fill as many shifts as possible.
    
    CONFIDENCE SCORE:
    - 0.9-1.0: Perfect Skill + Perfect Time match.
    - 0.7-0.8: Skill match but staff has high weekly hours.
    - 0.5-0.6: Substitute skill match (e.g., Billing for Customer Support).
    - 0.0: No possible match found.

    RESPONSE FORMAT (Strict JSON):
    {
      "assignments": [
        { "shiftId": 1, "staffId": 101, "confidence": 0.95 }
      ],
      "coveragePercentage": 100.0,
      "overtimeRisk": false,
    }
    """

    try:
      
      content = ai_chat([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": json.dumps(input_data)}
      ], temperature=0.0)

      # Extract JSON from response (handle markdown code blocks)
      content = content.strip()
      if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
          content = content[4:]
      content = content.strip()
      
      return json.loads(content)
    except Exception as e:
      raise Exception(f"Staffing Agent AI Error: {str(e)}")