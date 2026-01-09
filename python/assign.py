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
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(input_data)}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise Exception(f"Staffing Agent AI Error: {str(e)}")