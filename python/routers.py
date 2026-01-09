from fastapi import APIRouter, HTTPException
from .pydantic_classes.basemodels import SalesHistory, ChatRequest, DecisionPayload, ForecastAndDecideRequest, StaffAvailability
from .intent import vendex_intelligent_agent
import json
from .demand import get_forecast
from .decision import inventory_agent_decision
from .assign import assign_staff_to_shifts

router = APIRouter(prefix="/api", tags=["Inventory"])

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

@router.post("/process-intent", tags=["Customer Agent"])
async def process_intent(payload: ChatRequest):
    try:
        current_stock = payload.stock_list 
        
        # This now returns a DICTIONARY
        ai_response = vendex_intelligent_agent(payload.user_input, current_stock)

        # Use .get() to safely access keys
        action = ai_response.get("action", "CLARIFY")

        if action == "CLARIFY":
            return {
                "status": "NEED_INFO",
                "message": ai_response.get("clarifying_question") or ai_response.get("message")
            }

        return {
            "status": "SUCCESS",
            "intent": ai_response.get("intent_category"),
            "message": ai_response.get("message"),
            "bundle": ai_response.get("bundle", []),
            "confidence": ai_response.get("confidence_score", 0)
        }

    except Exception as e:
        print(f"CRITICAL ERROR IN ROUTER: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")
    
@router.post("/assign-staff", tags=["Staffing Agent"])
async def assign_staff(payload: StaffAvailability):
    try:
        data = payload.model_dump()
        assignment_plan = assign_staff_to_shifts(data)
        return assignment_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))