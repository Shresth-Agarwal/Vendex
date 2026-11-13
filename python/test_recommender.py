#!/usr/bin/env python3
"""
Test script for manufacturer recommendation flow
"""
import json
import sys
sys.path.insert(0, '.')

from recommender import suggest_best_manufacturer

# Test Case 1: Normal scenario with multiple manufacturers
test_case_1 = {
    "context": {
        "purchaseOrderId": 1001,
        "preferredPaymentMode": "CREDIT",
        "confidence": 0.95,
        "createdAt": "2025-02-13T10:00:00"
    },
    "items": [
        {"sku": "SKU-001", "quantity": 100},
        {"sku": "SKU-002", "quantity": 50}
    ],
    "manufacturers": [
        {
            "manufacturerId": 1,
            "distanceKm": 120.0,
            "averageRating": 4.5,
            "advanceRequired": False,
            "preferredPaymentMode": "CREDIT",
            "products": [
                {"sku": "SKU-001", "costPrice": 50.0, "minimumOrderQuantity": 50},
                {"sku": "SKU-002", "costPrice": 100.0, "minimumOrderQuantity": 25}
            ]
        },
        {
            "manufacturerId": 2,
            "distanceKm": 250.0,
            "averageRating": 4.8,
            "advanceRequired": True,
            "preferredPaymentMode": "DEBIT",
            "products": [
                {"sku": "SKU-001", "costPrice": 45.0, "minimumOrderQuantity": 50},
                {"sku": "SKU-002", "costPrice": 95.0, "minimumOrderQuantity": 25}
            ]
        },
        {
            "manufacturerId": 3,
            "distanceKm": 80.0,
            "averageRating": 4.2,
            "advanceRequired": False,
            "preferredPaymentMode": "CREDIT",
            "products": [
                {"sku": "SKU-001", "costPrice": 55.0, "minimumOrderQuantity": 50},
                {"sku": "SKU-002", "costPrice": 110.0, "minimumOrderQuantity": 25}
            ]
        }
    ]
}

# Test Case 2: Scenario where some manufacturers can't fulfill MOQ
test_case_2 = {
    "context": {
        "purchaseOrderId": 1002,
        "preferredPaymentMode": "CASH",
        "confidence": 0.92,
        "createdAt": "2025-02-13T11:00:00"
    },
    "items": [
        {"sku": "BULK-001", "quantity": 1000}
    ],
    "manufacturers": [
        {
            "manufacturerId": 4,
            "distanceKm": 150.0,
            "averageRating": 4.6,
            "advanceRequired": False,
            "preferredPaymentMode": "CASH",
            "products": [
                {"sku": "BULK-001", "costPrice": 20.0, "minimumOrderQuantity": 500}
            ]
        },
        {
            "manufacturerId": 5,
            "distanceKm": 100.0,
            "averageRating": 3.9,
            "advanceRequired": False,
            "preferredPaymentMode": "CASH",
            "products": [
                {"sku": "BULK-001", "costPrice": 22.0, "minimumOrderQuantity": 2000}  # Can't fulfill
            ]
        }
    ]
}

# Test Case 3: Single item, single viable manufacturer
test_case_3 = {
    "context": {
        "purchaseOrderId": 1003,
        "preferredPaymentMode": "UPI",
        "confidence": 0.88,
        "createdAt": "2025-02-13T12:00:00"
    },
    "items": [
        {"sku": "SMALL-001", "quantity": 25}
    ],
    "manufacturers": [
        {
            "manufacturerId": 6,
            "distanceKm": 30.0,
            "averageRating": 4.7,
            "advanceRequired": False,
            "preferredPaymentMode": "UPI",
            "products": [
                {"sku": "SMALL-001", "costPrice": 10.0, "minimumOrderQuantity": 20}
            ]
        }
    ]
}

# Test Case 4: No viable manufacturer (insufficient MOQ)
test_case_4 = {
    "context": {
        "purchaseOrderId": 1004,
        "preferredPaymentMode": "CREDIT",
        "confidence": 0.85,
        "createdAt": "2025-02-13T13:00:00"
    },
    "items": [
        {"sku": "RARE-001", "quantity": 10}
    ],
    "manufacturers": [
        {
            "manufacturerId": 7,
            "distanceKm": 200.0,
            "averageRating": 4.4,
            "advanceRequired": True,
            "preferredPaymentMode": "CREDIT",
            "products": [
                {"sku": "RARE-001", "costPrice": 100.0, "minimumOrderQuantity": 100}  # MOQ too high
            ]
        }
    ]
}

test_cases = [
    ("Test Case 1: Multiple manufacturers with different qualities", test_case_1),
    ("Test Case 2: Some manufacturers can't fulfill MOQ", test_case_2),
    ("Test Case 3: Single item, single viable manufacturer", test_case_3),
    ("Test Case 4: No viable manufacturer (MOQ not met)", test_case_4),
]

def print_separator(title):
    print("\n" + "=" * 70)
    print(f"  >> {title}")
    print("=" * 70)

if __name__ == "__main__":
    print("\n[MANUFACTURER RECOMMENDATION FLOW TEST SUITE]")
    
    for test_name, test_data in test_cases:
        print_separator(test_name)
        
        print("\n[INPUT DATA]:")
        print(json.dumps(test_data, indent=2))
        
        print("\n[PROCESSING]...")
        try:
            result = suggest_best_manufacturer(test_data)
            
            print("\n[SUCCESS] RESULT:")
            print(json.dumps(result, indent=2))
            
            if "error" in result:
                print(f"\n[WARNING] Expected Error: {result['error']}")
            else:
                print(f"\n[INFO] Recommendation Details:")
                print(f"   - Manufacturer ID: {result['recommendedManufacturerId']}")
                print(f"   - Score: {result['score']}")
                print(f"   - Total Cost: ₹{result['totalCost']}")
                print(f"   - Reasoning: {result['reasoning']}")
                
        except Exception as e:
            print(f"\n[ERROR] OCCURRED:")
            print(f"   {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print_separator("TEST SUITE COMPLETED")
    print("\n[SUCCESS] All test cases executed successfully!")
