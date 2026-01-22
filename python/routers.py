from fastapi import APIRouter, HTTPException
from .pydantic_classes.basemodels import SalesHistory, ChatRequest, DecisionPayload, ForecastAndDecideRequest, StaffAvailability, ReceiptRequest
from .intent import vendex_intelligent_agent
import json
from .demand import get_forecast
from .decision import inventory_agent_decision
from .assign import assign_staff_to_shifts
from .receipt import create_receipt_pdf
from fastapi.responses import FileResponse

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

        return ai_response

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