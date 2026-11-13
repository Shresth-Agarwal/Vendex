#!/usr/bin/env python3
"""
Diagnostic tool to verify FastAPI server connectivity and request handling
This script helps identify data flow issues between Spring Boot and FastAPI
"""
import json
import requests
from datetime import datetime
from typing import Dict, Any

# Configuration
API_BASE = "http://127.0.0.1:8000"
ENDPOINTS = {
    "health": "/",
    "roster": "/api/assign-staff",
    "sourcing": "/api/sourcing/recommend"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_status(msg, status="INFO"):
    colors = {
        "INFO": Colors.BLUE,
        "SUCCESS": Colors.GREEN,
        "ERROR": Colors.RED,
        "WARNING": Colors.YELLOW
    }
    color = colors.get(status, Colors.BLUE)
    print(f"{color}[{status}]{Colors.RESET} {msg}")

def check_server_health():
    """Check if FastAPI server is running"""
    print_status("Checking if FastAPI server is running...", "INFO")
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=2)
        if response.status_code == 200:
            print_status(f"FastAPI server is RUNNING at {API_BASE}", "SUCCESS")
            print(f"         Response: {response.json()}")
            return True
        else:
            print_status(f"Server returned {response.status_code}", "WARNING")
            return False
    except requests.exceptions.ConnectionError:
        print_status(f"Cannot connect to {API_BASE}", "ERROR")
        print("         Make sure FastAPI server is running:")
        print("         python -m uvicorn python.main:app --host 127.0.0.1 --port 8000")
        return False
    except Exception as e:
        print_status(f"Error: {str(e)}", "ERROR")
        return False

def test_roster_endpoint():
    """Test the roster/assign-staff endpoint"""
    print_status("\nTesting /api/assign-staff endpoint...", "INFO")
    
    # Test data matching Spring Boot's RosterInputDto structure
    test_payload = {
        "date": "2025-02-13",  # LocalDate gets serialized to string
        "shifts": [
            {
                "shiftId": 1,
                "startTime": "09:00",
                "endTime": "13:00",
                "requiredSkill": "BILLING"
            }
        ],
        "staff": [
            {
                "staffId": 101,
                "skills": ["BILLING"],
                "hourlyRate": 15.0,
                "hoursWorkedThisWeek": 20,
                "availability": [
                    {
                        "day": "THURSDAY",
                        "startTime": "08:00",
                        "endTime": "17:00"
                    }
                ]
            }
        ]
    }
    
    print(f"Sending request to {API_BASE}/api/assign-staff")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_BASE}/api/assign-staff",
            json=test_payload,
            timeout=10
        )
        
        print_status(f"Response Status: {response.status_code}", 
                    "SUCCESS" if response.status_code == 200 else "ERROR")
        
        try:
            data = response.json()
            print(f"Response Body:\n{json.dumps(data, indent=2)}")
            return response.status_code == 200
        except:
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print_status("Request timed out (30 seconds)", "ERROR")
        print("         The server might be slow or the request is being blocked")
        return False
    except requests.exceptions.ConnectionError:
        print_status("Connection error - server not responding", "ERROR")
        return False
    except Exception as e:
        print_status(f"Error: {str(e)}", "ERROR")
        return False

def test_sourcing_endpoint():
    """Test the sourcing recommendation endpoint"""
    print_status("\nTesting /api/sourcing/recommend endpoint...", "INFO")
    
    test_payload = {
        "context": {
            "purchaseOrderId": 1001,
            "preferredPaymentMode": "CREDIT",
            "confidence": 0.92,
            "createdAt": "2025-02-13T10:00:00"
        },
        "items": [
            {"sku": "TEST-001", "quantity": 100}
        ],
        "manufacturers": [
            {
                "manufacturerId": 201,
                "distanceKm": 100.0,
                "averageRating": 4.5,
                "advanceRequired": False,
                "preferredPaymentMode": "CREDIT",
                "products": [
                    {"sku": "TEST-001", "costPrice": 50.0, "minimumOrderQuantity": 50}
                ]
            }
        ]
    }
    
    print(f"Sending request to {API_BASE}/api/sourcing/recommend")
    
    try:
        response = requests.post(
            f"{API_BASE}/api/sourcing/recommend",
            json=test_payload,
            timeout=10
        )
        
        print_status(f"Response Status: {response.status_code}",
                    "SUCCESS" if response.status_code == 200 else "ERROR")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            return response.status_code == 200
        except:
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_status(f"Error: {str(e)}", "ERROR")
        return False

def main():
    print("\n" + "="*70)
    print("  FastAPI <-> Spring Boot CONNECTIVITY DIAGNOSTIC")
    print("="*70 + "\n")
    
    results = {}
    
    # Check server health
    results['health'] = check_server_health()
    
    if not results['health']:
        print_status("\nFastAPI server is not running.", "ERROR")
        print("         Cannot proceed with endpoint tests.")
        print("\nTo start the server, run:")
        print("  cd Vendex")
        print("  python -m uvicorn python.main:app --host 127.0.0.1 --port 8000")
        return
    
    # Test endpoints
    results['roster'] = test_roster_endpoint()
    results['sourcing'] = test_sourcing_endpoint()
    
    # Summary
    print("\n" + "="*70)
    print("  DIAGNOSTIC SUMMARY")
    print("="*70 + "\n")
    
    print(f"Server Health:            {('✓ PASS' if results['health'] else '✗ FAIL')}")
    print(f"Roster Endpoint:          {('✓ PASS' if results.get('roster') else '✗ FAIL')}")
    print(f"Sourcing Endpoint:        {('✓ PASS' if results.get('sourcing') else '✗ FAIL')}")
    
    if all(results.values()):
        print_status("\nAll tests passed! Communication is working.", "SUCCESS")
    else:
        print_status("\nSome tests failed. See details above.", "WARNING")
    
    print("\n" + "="*70)
    print("TROUBLESHOOTING GUIDE")
    print("="*70)
    print("""
If server is not running:
  1. Open terminal in python directory
  2. Run: python -m uvicorn python.main:app --host 127.0.0.1 --port 8000
  3. Check for error messages

If endpoint tests fail:
  1. Check FastAPI logs for deserialization errors
  2. Verify request payload format matches expected models
  3. Look for 422 (Validation Error) status codes
  4. Check if StaffAvailability Pydantic model is receiving correct data

If requests from Spring Boot never reach server:
  1. Verify WebClient configuration points to http://localhost:8000
  2. Add request logging interceptor to WebClient
  3. Check Spring Boot logs for errors
  4. Verify no firewall blocking localhost:8000
  5. Test with curl: curl -X POST http://localhost:8000/api/assign-staff -H "Content-Type: application/json" -d '{...}'
    """)

if __name__ == "__main__":
    main()
