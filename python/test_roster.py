#!/usr/bin/env python3
"""
Test script for roster generation functionality
"""
import json
import sys
sys.path.insert(0, '.')

from assign import assign_staff_to_shifts

# Sample test data
test_input = {
    "date": "2025-02-13",
    "shifts": [
        {
            "shiftId": 1,
            "startTime": "09:00",
            "endTime": "13:00",
            "requiredSkill": "BILLING"
        },
        {
            "shiftId": 2,
            "startTime": "13:00",
            "endTime": "17:00",
            "requiredSkill": "ORDER_PICKING"
        }
    ],
    "staff": [
        {
            "staffId": 101,
            "skills": ["BILLING"],
            "hourlyRate": 10.0,
            "hoursWorkedThisWeek": 20,
            "availability": [
                {
                    "day": "THURSDAY",
                    "startTime": "08:00",
                    "endTime": "17:00"
                }
            ]
        },
        {
            "staffId": 102,
            "skills": ["ORDER_PICKING"],
            "hourlyRate": 10.0,
            "hoursWorkedThisWeek": 25,
            "availability": [
                {
                    "day": "THURSDAY",
                    "startTime": "12:00",
                    "endTime": "18:00"
                }
            ]
        }
    ]
}

try:
    print("Testing roster generation...")
    print(f"Input data: {json.dumps(test_input, indent=2)}")
    print("\n" + "="*50 + "\n")
    
    result = assign_staff_to_shifts(test_input)
    
    print(f"Success! Result: {json.dumps(result, indent=2)}")
    
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
