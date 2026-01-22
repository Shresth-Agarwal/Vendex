import pandas as pd
import numpy as np

def suggest_best_manufacturer(input_data):
    items_needed = input_data['items']
    manufacturers = input_data['manufacturers']
    buyer_preferred_payment = input_data['context']['preferredPaymentMode']

    valid_manufacturers = []

    # 1. FEASIBILITY + AGGREGATION
    for m in manufacturers:
        product_map = {p["sku"]: p for p in m["products"]}
        total_cost = 0
        valid = True

        for item in items_needed:
            if item["sku"] not in product_map:
                valid = False
                break

            prod = product_map[item["sku"]]
            if item["quantity"] < prod["minimumOrderQuantity"]:
                valid = False
                break

            total_cost += prod["costPrice"] * item["quantity"]

        if valid:
            valid_manufacturers.append({
                "manufacturerId": m["manufacturerId"],
                "total_cost": total_cost,
                "distance": m["distanceKm"],
                "rating": m["averageRating"],
                "advance": 1 if m["advanceRequired"] else 0,
                "payment": m["preferredPaymentMode"]
            })

    if not valid_manufacturers:
        return {"error": "No manufacturer can fulfill all items with required MOQs."}

    df = pd.DataFrame(valid_manufacturers)

    # 2. NORMALIZATION (Higher is better)
    df['cost_score'] = 1 - (df['total_cost'] - df['total_cost'].min()) / (df['total_cost'].max() - df['total_cost'].min() + 1)
    df['dist_score'] = 1 - (df['distance'] - df['distance'].min()) / (df['distance'].max() - df['distance'].min() + 1)
    df['rating_score'] = df['rating'] / 5.0
    df['advance_penalty'] = df['advance'].apply(lambda x: 0.8 if x == 1 else 1.0)
    df['payment_score'] = df['payment'].apply(lambda x: 1.0 if x == buyer_preferred_payment else 0.9)

    # 3. WEIGHTS
    weights = {
        "cost": 0.45,
        "rating": 0.25,
        "distance": 0.15,
        "advance": 0.10,
        "payment": 0.05
    }

    df['final_score'] = (
        (df['cost_score'] * weights['cost']) +
        (df['rating_score'] * weights['rating']) +
        (df['dist_score'] * weights['distance']) +
        (df['advance_penalty'] * weights['advance']) +
        (df['payment_score'] * weights['payment'])
    )

    # 4. WINNER
    winner = df.loc[df['final_score'].idxmax()]

    return {
        "recommendedManufacturerId": int(winner["manufacturerId"]),
        "score": round(float(winner["final_score"]), 4),
        "totalCost": int(winner["total_cost"]),
        "reasoning": (
            f"Selected based on lowest effective cost (₹{int(winner['total_cost'])}), "
            f"rating {winner['rating']}, distance {winner['distance']} km, "
            f"and compatibility with preferred payment mode."
        )
    }