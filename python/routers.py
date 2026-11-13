from fastapi import APIRouter, HTTPException
from .pydantic_classes.basemodels import SalesHistory, ChatRequest, DecisionPayload, ForecastAndDecideRequest, StaffAvailability, ReceiptRequest, SourcingRequest
from .intent import vendex_intelligent_agent
import json
import logging
from .demand import get_forecast
from .decision import inventory_agent_decision
from .assign import assign_staff_to_shifts
from .receipt import create_receipt_pdf
from .recommender import suggest_best_manufacturer
from fastapi.responses import FileResponse

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

@router.post("/debug/raw-request")
async def debug_raw_request(request_data: dict):
    """Debug endpoint to see raw incoming requests"""
    logger.info(f"[DEBUG] Raw request received:")
    logger.info(f"[DEBUG] Keys: {list(request_data.keys())}")
    logger.info(f"[DEBUG] Full payload: {json.dumps(request_data, indent=2, default=str)}")
    return {"success": True, "received_keys": list(request_data.keys())}

@router.post("/forecast", tags=["Inventory"])
def forecast(payload: SalesHistory):
    try:
        f, c = get_forecast(payload.sales_history)
        return {"forecast": f, "confidence": c}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@router.post("/decision", tags=["Inventory"])
def decision(payload: DecisionPayload):
    return inventory_agent_decision(
        payload.forecast, payload.confidence, payload.current_stock, payload.unit_cost
    )

@router.post("/forecast-and-decide", tags=["Inventory"])
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

        return ai_response

    except Exception as e:
        print(f"CRITICAL ERROR IN ROUTER: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")
    
@router.post("/assign-staff", tags=["Staffing Agent"])
async def assign_staff(payload: StaffAvailability):
    logger.info(f"[ASSIGN-STAFF] Request received for date: {payload.date}")
    logger.info(f"[ASSIGN-STAFF] Payload keys: {list(payload.__dict__.keys())}")
    logger.info(f"[ASSIGN-STAFF] Number of shifts: {len(payload.shifts)}")
    logger.info(f"[ASSIGN-STAFF] Number of staff: {len(payload.staff)}")
    
    try:
        data = payload.model_dump()
        logger.debug(f"[ASSIGN-STAFF] Converted to dict successfully")
        
        assignment_plan = assign_staff_to_shifts(data)
        logger.info(f"[ASSIGN-STAFF] Assignments generated: {len(assignment_plan.get('assignments', []))}")
        
        return assignment_plan
    except Exception as e:
        logger.error(f"[ASSIGN-STAFF] Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-receipt", tags=["Receipt Generator"])
async def generate_receipt(payload: ReceiptRequest):
    try:
        # 1. Convert Pydantic model to Dictionary
        data = payload.model_dump()
        
        # 2. Create a unique filename
        po_id = data['purchaseOrder']['purchaseOrderId']
        filename = f"receipts/receipt_{po_id}.pdf"
        
        # 3. Generate the PDF (using the code I gave you earlier)
        # Make sure the create_receipt_pdf function is accessible
        create_receipt_pdf(data, filename)
        
        # 4. Return the file for download
        return FileResponse(
            path=filename, 
            filename=filename, 
            media_type='application/pdf'
        )

    except Exception as e:
        print(f"Error generating receipt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sourcing/recommend", tags=["Sourcing Recommender"])
async def recommend_manufacturer(payload: SourcingRequest):
    try:
        # 1. Convert Pydantic to Dict
        data = payload.model_dump()
        
        # 2. Run the scoring logic
        winner = suggest_best_manufacturer(data)
        
        if not winner:
            raise HTTPException(status_code=500, detail="Recommender returned no result")
        
        if "error" in winner:
            raise HTTPException(status_code=400, detail=winner["error"])

        # 3. Return the recommendation (recommender already formats it)
        return winner
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in manufacturer recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")