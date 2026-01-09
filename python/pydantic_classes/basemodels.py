from pydantic import BaseModel
from typing import List

class SalesHistory(BaseModel):
    sales_history: List[float]

class ForecastResponse(BaseModel):
    forecast: int
    confidence: float

class DecisionPayload(BaseModel):
    forecast: int
    confidence: float
    current_stock: int
    unit_cost: float

class ForecastAndDecideRequest(SalesHistory):
    current_stock: int
    unit_cost: float
    
class ChatRequest(BaseModel):
    user_input: str

class StaffAvailability(BaseModel):
    input_data: dict[dict[str,any]]