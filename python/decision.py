def inventory_agent_decision(forecast_value, confidence_score, current_stock, unit_cost):
    """
    The 'Brain' that decides the action based on ML confidence.
    """
    # 1. Define thresholds
    HIGH_CONFIDENCE = 0.80
    MID_CONFIDENCE = 0.60
    
    # 2. Logic: How much do we actually need to buy?
    # We want enough for the forecast + a 10% safety buffer
    target_stock = forecast_value * 1.10
    reorder_quantity = target_stock - current_stock
    
    # 3. Decision Tree
    if reorder_quantity <= 0:
        return {"action": "NONE", "quantity": 0, "reason": "Stock levels sufficient for forecasted demand."}
    
    total_cost = reorder_quantity * unit_cost

    if confidence_score >= HIGH_CONFIDENCE:
        # If confidence is high and cost is low, auto-approve
        if total_cost < 1000: 
            return {
                "action": "AUTO_ORDER", 
                "quantity": int(reorder_quantity), 
                "reason": f"High confidence ({confidence_score}) and low risk."
            }
        else:
            return {
                "action": "REQUIRE_APPROVAL", 
                "quantity": int(reorder_quantity), 
                "reason": "High confidence but high cost. Needs manager signature."
            }
            
    elif confidence_score >= MID_CONFIDENCE:
        return {
            "action": "REQUIRE_APPROVAL", 
            "quantity": int(reorder_quantity), 
            "reason": "Moderate confidence. Human oversight required."
        }
    
    else:
        return {
            "action": "FALLBACK_TO_MANUAL", 
            "quantity": 0, 
            "reason": "Low confidence. AI refuses to make a decision."
        }

# --- TEST ---
forecast, confidence = 205, 0.98
stock_now = 50
price_per_unit = 15.0

decision = inventory_agent_decision(forecast, confidence, stock_now, price_per_unit)
print(f"Decision: {decision['action']} | Quantity: {decision['quantity']} | Why: {decision['reason']}")