import pandas as pd
import numpy as np

def suggest_best_manufacturer(input_data):
    items_needed = input_data['items']
    manufacturers = input_data['manufacturers']
    buyer_preferred_payment = input_data['context']['preferredPaymentMode']
    
    # 1. Prepare Data for Scoring
    processed_list = []
    
    for m in manufacturers:
        for item in items_needed:
            # Find the matching product in manufacturer's list
            prod = next((p for p in m['products'] if p['sku'] == item['sku']), None)
            
            if prod:
                # CONSTRAINT CHECK: Can they actually fulfill this order?
                if item['quantity'] < prod['minimumOrderQuantity']:
                    continue # Skip this manufacturer for this item
                
                total_cost = prod['costPrice'] * item['quantity']
                
                processed_list.append({
                    "manufacturerId": m['manufacturerId'],
                    "total_cost": total_cost,
                    "distance": m['distanceKm'],
                    "rating": m['averageRating'],
                    "advance": 1 if m['advanceRequired'] else 0,
                    "payment": m['preferredPaymentMode']
                })

    if not processed_list:
        return {"error": "No manufacturer meets the Minimum Order Quantity requirements."}

    df = pd.DataFrame(processed_list)

    # 2. NORMALIZATION (Scaling values between 0 and 1)
    # Higher score is ALWAYS better
    df['cost_score'] = 1 - (df['total_cost'] - df['total_cost'].min()) / (df['total_cost'].max() - df['total_cost'].min() + 1)
    df['dist_score'] = 1 - (df['distance'] - df['distance'].min()) / (df['distance'].max() - df['distance'].min() + 1)
    df['rating_score'] = df['rating'] / 5.0
    df['advance_penalty'] = df['advance'].apply(lambda x: 0.8 if x == 1 else 1.0)
    df['payment_score'] = df['payment'].apply(lambda x: 1.0 if x == buyer_preferred_payment else 0.9)
    
    # 3. WEIGHTED SCORING (Tweak these based on store preference)
    # Price is usually the most important
    weights = {
        "cost": 0.48,
        "rating": 0.24,
        "distance": 0.14,
        "advance": 0.09,
        "payment": 0.05
    }

    df['final_score'] = (
        (df['cost_score'] * weights['cost']) +
        (df['rating_score'] * weights['rating']) +
        (df['dist_score'] * weights['distance']) +
        (df['advance_penalty'] * weights['advance']) +
        (df['payment_score'] * weights['payment'])
    )

    # 4. GET THE WINNER
    winner = df.loc[df['final_score'].idxmax()]
    
    return winner.to_dict()

'''data = {
  "context": {
    "purchaseOrderId": 1243,
    "preferredPaymentMode": "UPI",
    "confidence": 0.92,
    "createdAt": "2026-01-22T10:30:00"
  },
  "items": [
    {
      "sku": "RICE_25KG",
      "quantity": 40
    }
  ],
  "manufacturers": [
    {
      "manufacturerId": 12,
      "distanceKm": 18.5,
      "averageRating": 4.3,
      "advanceRequired": True,
      "preferredPaymentMode": "UPI",
      "products": [
        {
          "sku": "RICE_25KG",
          "costPrice": 1120,
          "minimumOrderQuantity": 10
        }
      ]
    },
    {
      "manufacturerId": 19,
      "distanceKm": 6.2,
      "averageRating": 3.8,
      "advanceRequired": False,
      "preferredPaymentMode": "CREDIT",
      "products": [
        {
          "sku": "RICE_25KG",
          "costPrice": 1180,
          "minimumOrderQuantity": 5
        }
      ]
    }
  ]
}
print(suggest_best_manufacturer(data))'''