# python/FastAPI/router.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from .demand import get_forecast
from .decision import inventory_agent_decision

router = APIRouter(prefix="/api", tags=["Inventory"])

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

@router.post("/forecast")
def forecast(payload: SalesHistory):
    try:
        f, c = get_forecast(payload.sales_history)
        return {"forecast": f, "confidence": c}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@router.post("/decision")
def decision(payload: DecisionPayload):
    return inventory_agent_decision(
        payload.forecast, payload.confidence, payload.current_stock, payload.unit_cost
    )

@router.post("/forecast-and-decide")
def forecast_and_decide(payload: ForecastAndDecideRequest):
    try:
        f, c = get_forecast(payload.sales_history)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    decision = inventory_agent_decision(f, c, payload.current_stock, payload.unit_cost)
    return {"forecast": f, "confidence": c, "decision": decision}