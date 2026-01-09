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

input_data={
  "date": "2026-01-08",
  "shifts": [
    {
      "shiftId": 1,
      "startTime": "09:00",
      "endTime": "13:00",
      "requiredSkill": "BILLING"
    },
    {
      "shiftId": 2,
      "startTime": "13:00",
      "endTime": "18:00",
      "requiredSkill": "BILLING"
    },
    {
      "shiftId": 3,
      "startTime": "10:00",
      "endTime": "16:00",
      "requiredSkill": "ORDER_PICKING"
    },
    {
      "shiftId": 4,
      "startTime": "09:00",
      "endTime": "17:00",
      "requiredSkill": "INVENTORY_HANDLING"
    }
  ],
  "staff": [
    {
      "staffId": 1,
      "skills": ["BILLING", "CUSTOMER_SUPPORT"],
      "hourlyRate": 150,
      "hoursWorkedThisWeek": 24,
      "availability": [
        { "day": "THURSDAY", "start": "09:00", "end": "17:00" }
      ]
    },
    {
      "staffId": 2,
      "skills": ["BILLING"],
      "hourlyRate": 145,
      "hoursWorkedThisWeek": 38,
      "availability": [
        { "day": "THURSDAY", "start": "12:00", "end": "20:00" }
      ]
    },
    {
      "staffId": 3,
      "skills": ["ORDER_PICKING", "INVENTORY_HANDLING"],
      "hourlyRate": 160,
      "hoursWorkedThisWeek": 16,
      "availability": [
        { "day": "THURSDAY", "start": "08:00", "end": "16:00" }
      ]
    },
    {
      "staffId": 4,
      "skills": ["ORDER_PICKING"],
      "hourlyRate": 155,
      "hoursWorkedThisWeek": 20,
      "availability": [
        { "day": "THURSDAY", "start": "14:00", "end": "22:00" }
      ]
    },
    {
      "staffId": 5,
      "skills": ["INVENTORY_HANDLING", "SUPERVISION"],
      "hourlyRate": 200,
      "hoursWorkedThisWeek": 30,
      "availability": [
        { "day": "THURSDAY", "start": "09:00", "end": "18:00" }
      ]
    }
  ]
}

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