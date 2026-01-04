import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def get_forecast(sales_history):
    """
    sales_history: list or array-like of sales (at least 2 values)
    Returns: (predicted_total_for_next_week (int), confidence_score (float))
    """
    # Basic validation
    if sales_history is None:
        raise ValueError("sales_history must be a non-empty list or array-like")
    sales_arr = np.asarray(sales_history, dtype=float)
    if sales_arr.size < 2:
        raise ValueError("sales_history must contain at least two data points")

    # 1. Fit Linear Regression to see the trend
    days = np.arange(sales_arr.size).reshape(-1, 1)
    model = LinearRegression().fit(days, sales_arr)

    # 2. Predict next 7 days
    next_days = np.arange(sales_arr.size, sales_arr.size + 7).reshape(-1, 1)
    predictions = model.predict(next_days)
    forecast_total = float(np.sum(predictions))

    # 3. Confidence score (relative std dev vs total sales)
    std_dev = float(np.std(sales_arr))
    total_sales = float(np.sum(sales_arr))
    if total_sales <= 0:
        confidence = 0.5  # fallback to minimum confidence
    else:
        confidence = 1.0 - (std_dev / total_sales)
        confidence = max(0.0, min(1.0, confidence))  # clamp to [0, 1]
        confidence = max(0.5, confidence)  # keep at least 0.5 as before

    # Return native Python types: int and float (rounded)
    return int(round(forecast_total)), float(round(confidence, 2))

# Example use:
if __name__ == "__main__":
    history = [10, 12, 11, 15, 14, 13, 16, 18, 20, 19, 21, 23, 22, 25, 24]  # 15 days
    result = get_forecast(history)
    print(result)            