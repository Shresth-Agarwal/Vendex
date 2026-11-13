#!/usr/bin/env python3
"""
End-to-end HTTP test for the manufacturer recommendation API endpoint
This test makes actual HTTP calls to the FastAPI server
"""
import json
import sys
import time
import requests
from subprocess import Popen, PIPE
import signal
import os

# Test endpoint URL
API_URL = "http://127.0.0.1:8000/api/sourcing/recommend"

# Test payloads
test_success = {
    "context": {
        "purchaseOrderId": 2001,
        "preferredPaymentMode": "CREDIT",
        "confidence": 0.92,
        "createdAt": "2025-02-13T15:00:00"
    },
    "items": [
        {"sku": "API-TEST-A", "quantity": 300},
        {"sku": "API-TEST-B", "quantity": 200}
    ],
    "manufacturers": [
        {
            "manufacturerId": 201,
            "distanceKm": 120.0,
            "averageRating": 4.6,
            "advanceRequired": False,
            "preferredPaymentMode": "CREDIT",
            "products": [
                {"sku": "API-TEST-A", "costPrice": 25.0, "minimumOrderQuantity": 100},
                {"sku": "API-TEST-B", "costPrice": 20.0, "minimumOrderQuantity": 100}
            ]
        },
        {
            "manufacturerId": 202,
            "distanceKm": 90.0,
            "averageRating": 4.8,
            "advanceRequired": False,
            "preferredPaymentMode": "CREDIT",
            "products": [
                {"sku": "API-TEST-A", "costPrice": 23.0, "minimumOrderQuantity": 100},
                {"sku": "API-TEST-B", "costPrice": 19.0, "minimumOrderQuantity": 100}
            ]
        }
    ]
}

test_failure = {
    "context": {
        "purchaseOrderId": 2002,
        "preferredPaymentMode": "CASH",
        "confidence": 0.88,
        "createdAt": "2025-02-13T15:15:00"
    },
    "items": [
        {"sku": "RARE-ITEM", "quantity": 10}
    ],
    "manufacturers": [
        {
            "manufacturerId": 203,
            "distanceKm": 200.0,
            "averageRating": 4.4,
            "advanceRequired": True,
            "preferredPaymentMode": "CASH",
            "products": [
                {"sku": "RARE-ITEM", "costPrice": 100.0, "minimumOrderQuantity": 500}
            ]
        }
    ]
}

def start_fastapi_server():
    """Start the FastAPI server in background"""
    print("\n🚀 Starting FastAPI server...")
    cwd = r"C:\Users\Rishi\Desktop\Program related\Projects\Vendex"
    
    # Try to start the server
    try:
        process = Popen(
            ["python", "-m", "uvicorn", "python.main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=cwd,
            stdout=PIPE,
            stderr=PIPE,
            creationflags=0x00000008 if sys.platform == 'win32' else 0  # CREATE_NO_WINDOW on Windows
        )
        
        # Wait for server to start
        print("⏳ Waiting for server to be ready...")
        time.sleep(5)
        
        # Check if server is responding
        try:
            response = requests.get("http://127.0.0.1:8000/", timeout=2)
            if response.status_code == 200:
                print("✅ FastAPI server is running")
                return process
        except:
            pass
        
        print("⚠️  Server may not be ready yet, proceeding with test...")
        return process
    except Exception as e:
        print(f"❌ Failed to start server: {str(e)}")
        return None

def stop_fastapi_server(process):
    """Stop the FastAPI server"""
    if process:
        print("\n🛑 Stopping FastAPI server...")
        try:
            process.terminate()
            process.wait(timeout=5)
            print("✅ Server stopped")
        except:
            process.kill()
            print("✅ Server killed")

def test_endpoint(test_name, payload, expect_success=True):
    """Test a single endpoint call"""
    print(f"\n{'='*70}")
    print(f"  {test_name}")
    print(f"{'='*70}")
    
    print(f"\n📤 Sending request to: {API_URL}")
    print(f"📋 Payload PO ID: {payload['context']['purchaseOrderId']}")
    
    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=10
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS")
            print(f"   Recommendation:")
            print(f"   ├─ Manufacturer ID: {result.get('recommendedManufacturerId')}")
            print(f"   ├─ Score: {result.get('score')}")
            print(f"   ├─ Total Cost: ₹{result.get('totalCost')}")
            print(f"   └─ Reasoning: {result.get('reasoning')[:60]}...")
            
            if expect_success:
                return True
            else:
                print(f"\n⚠️  Expected failure but got success")
                return False
        else:
            print(f"\n⚠️  HTTP {response.status_code}")
            error_msg = response.json() if response.text else "No error message"
            print(f"   Error: {error_msg}")
            
            if not expect_success and response.status_code >= 400:
                print(f"\n✅ Got expected error")
                return True
            else:
                print(f"\n❌ Unexpected response")
                return False
                
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Could not connect to server at {API_URL}")
        print("   Make sure the FastAPI server is running on port 8000")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  🌐 MANUFACTURER RECOMMENDATION - HTTP ENDPOINT TEST")
    print("="*70)
    
    # Note: In a real scenario, the server should already be running
    # This test assumes the server is accessible at the configured URL
    
    print("\n⚠️  NOTE: This test requires the FastAPI server to be running!")
    print("   If you haven't started it yet, you'll need to:")
    print("   1. Open a terminal in the python directory")
    print("   2. Run: python -m uvicorn main:app --host 127.0.0.1 --port 8000")
    
    # Test 1: Success case
    success = test_endpoint(
        "Test 1: Valid Recommendation Request",
        test_success,
        expect_success=True
    )
    
    # Test 2: Failure case
    failure = test_endpoint(
        "Test 2: No Viable Manufacturer (Expected Error)",
        test_failure,
        expect_success=False
    )
    
    print(f"\n{'='*70}")
    print("  📊 TEST RESULTS SUMMARY")
    print(f"{'='*70}")
    
    if success and failure:
        print("\n✅ All HTTP endpoint tests passed!")
        print("   The manufacturer recommendation API is working correctly.")
    elif success:
        print("\n⚠️  Success case passed, but failure case needs verification")
    elif failure:
        print("\n⚠️  Failure case passed, but success case needs verification")
    else:
        print("\n❌ Tests failed - please check server connectivity")
    
    print(f"\n{'='*70}\n")
