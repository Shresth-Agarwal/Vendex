from pydantic import BaseModel
from typing import List, Dict, Any, Optional

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
    stock_list: List[Dict[str, Any]]

class StaffAvailability(BaseModel):
    date: str
    shifts: List[Dict[str, Any]]
    staff: List[Dict[str, Any]]