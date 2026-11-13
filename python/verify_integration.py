#!/usr/bin/env python3
"""
Simple verification script to ensure Spring Boot <-> FastAPI integration is working
Run this after starting the FastAPI server to confirm everything is connected properly
"""

import requests
import json
import sys
from datetime import datetime

def test_health():
    """Test if FastAPI server is running"""
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=2)
        if response.status_code == 200:
            print("✓ FastAPI server is running")
            return True
    except:
        pass
    
    print("✗ FastAPI server is NOT running")
    print("  Start it with: python -m uvicorn python.main:app --host 127.0.0.1 --port 8000")
    return False

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://127.0.0.1:8000/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health endpoint working: {data['status']}")
            return True
    except:
        pass
    
    print("✗ Health endpoint failed")
    return False

def test_roster_endpoint():
    """Test the roster assignment endpoint"""
    payload = {
        "date": "2025-02-13",
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
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/assign-staff",
            json=payload,
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            assignments = data.get('assignments', [])
            print(f"✓ Roster endpoint working - {len(assignments)} assignment(s) generated")
            return True
        else:
            print(f"✗ Roster endpoint returned {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print("✗ Roster endpoint timed out")
        return False
    except Exception as e:
        print(f"✗ Roster endpoint error: {str(e)}")
        return False

def test_sourcing_endpoint():
    """Test the sourcing recommendation endpoint"""
    payload = {
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
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/sourcing/recommend",
            json=payload,
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if "recommendedManufacturerId" in data:
                print(f"✓ Sourcing endpoint working - Recommended manufacturer ID: {data['recommendedManufacturerId']}")
                return True
        else:
            print(f"✗ Sourcing endpoint returned {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print("✗ Sourcing endpoint timed out")
        return False
    except Exception as e:
        print(f"✗ Sourcing endpoint error: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("  SPRING BOOT ↔ FASTAPI INTEGRATION VERIFICATION")
    print("="*60 + "\n")
    
    print("[1/4] Checking if FastAPI server is running...")
    if not test_health():
        sys.exit(1)
    
    print("\n[2/4] Testing health endpoint...")
    if not test_health_endpoint():
        sys.exit(1)
    
    print("\n[3/4] Testing roster assignment endpoint...")
    roster_ok = test_roster_endpoint()
    
    print("\n[4/4] Testing sourcing recommendation endpoint...")
    sourcing_ok = test_sourcing_endpoint()
    
    print("\n" + "="*60)
    if roster_ok and sourcing_ok:
        print("  ✓ ALL ENDPOINTS WORKING - Integration is ready!")
    else:
        print("  ⚠ Some endpoints failed - see details above")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nVerification cancelled")
        sys.exit(0)
    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")
        sys.exit(1)
