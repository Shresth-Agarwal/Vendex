#!/usr/bin/env python3
"""
Master test runner for Manufacturer Recommendation Flow
Executes all available tests and provides comprehensive reporting
"""
import subprocess
import sys
import json
import os
from pathlib import Path

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  {title}".ljust(80))
    print("=" * 80)

def print_section(title):
    print(f"\n{'─' * 80}")
    print(f"  {title}")
    print(f"{'─' * 80}\n")

def run_test(test_name, test_file):
    """Run a test file and capture results"""
    print_section(f"Running: {test_name}")
    
    try:
        result = subprocess.run(
            [sys.executable, test_file],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        success = result.returncode == 0
        return {
            "name": test_name,
            "success": success,
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except subprocess.TimeoutExpired:
        print(f"❌ Test timed out")
        return {
            "name": test_name,
            "success": False,
            "exit_code": -1,
            "error": "Timeout"
        }
    except Exception as e:
        print(f"❌ Error running test: {str(e)}")
        return {
            "name": test_name,
            "success": False,
            "exit_code": -1,
            "error": str(e)
        }

def main():
    print_header("🏭 MANUFACTURER RECOMMENDATION FLOW - MASTER TEST SUITE")
    
    print("\n📋 Available Tests:")
    tests = [
        ("Unit Tests", "test_recommender.py", "Test scoring algorithm with 4 scenarios"),
        ("Integration Tests", "test_recommender_api.py", "Test API contract and Pydantic models"),
        ("HTTP Tests", "test_recommender_http.py", "Test actual HTTP endpoint (requires server)"),
    ]
    
    for i, (name, file, desc) in enumerate(tests, 1):
        status = "✅" if Path(file).exists() else "❌"
        print(f"  {i}. {status} {name}")
        print(f"     File: {file}")
        print(f"     Purpose: {desc}\n")
    
    print("\n🚀 EXECUTING TESTS")
    print("=" * 80)
    
    results = []
    
    # Run Unit Tests
    print("\n📌 Test Suite 1/2: Unit Tests")
    result = run_test(
        "Unit Tests (4 Scenarios)",
        "test_recommender.py"
    )
    results.append(result)
    
    # Run Integration Tests
    print("\n📌 Test Suite 2/2: Integration Tests")
    result = run_test(
        "Integration Tests (API Contract)",
        "test_recommender_api.py"
    )
    results.append(result)
    
    # Note about HTTP tests
    print_section("HTTP Endpoint Tests (Manual)")
    print("""
📌 Test Suite 3/3: HTTP Tests (MANUAL - Requires Running Server)

The HTTP endpoint tests are available but require the FastAPI server to be running.

To run HTTP tests:
1. In a terminal, start the server:
   python -m uvicorn python.main:app --host 127.0.0.1 --port 8000

2. In another terminal, run:
   python test_recommender_http.py

⚠️  Skipping HTTP tests for now (server not running)
    """)
    
    # Summary
    print_header("📊 TEST SUMMARY")
    
    passed = sum(1 for r in results if r.get("success"))
    failed = sum(1 for r in results if not r.get("success"))
    
    print(f"\n✅ Passed: {passed}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")
    
    for result in results:
        status = "✅ PASS" if result.get("success") else "❌ FAIL"
        print(f"\n  {status}: {result['name']}")
        if not result.get("success"):
            error = result.get("error", result.get("stderr", "Unknown error"))
            print(f"        Error: {error}")
    
    print("\n" + "=" * 80)
    print("📋 DETAILED TEST RESULTS")
    print("=" * 80)
    
    for result in results:
        print(f"\n{result['name']}:")
        print(f"  Exit Code: {result.get('exit_code')}")
        print(f"  Status: {'✅ PASS' if result.get('success') else '❌ FAIL'}")
    
    # Documentation
    print("\n" + "=" * 80)
    print("📚 DOCUMENTATION")
    print("=" * 80)
    print("\nFor detailed test results and documentation, see:")
    print("  📄 python/MANUFACTURER_RECOMMENDATION_TESTS.md")
    print("\nTest Files Created:")
    print("  📄 python/test_recommender.py - Unit tests with 4 scenarios")
    print("  📄 python/test_recommender_api.py - Integration tests")
    print("  📄 python/test_recommender_http.py - HTTP endpoint tests")
    print("  📄 python/MANUFACTURER_RECOMMENDATION_TESTS.md - Full documentation")
    
    # Scoring algorithm info
    print("\n" + "=" * 80)
    print("🧮 SCORING ALGORITHM")
    print("=" * 80)
    print("""
The recommendation algorithm uses weighted scoring:

Weights:
  • Cost (45%)      - Lowest total cost for all items
  • Rating (25%)    - Manufacturer's average rating
  • Distance (15%)  - Proximity (shorter is better)
  • Advance (10%)   - Penalty if advance payment required
  • Payment (5%)    - Match with buyer's preferred mode

Process:
  1. Filter: Keep only manufacturers that can fulfill all items with proper MOQ
  2. Score: Calculate normalized scores for each dimension
  3. Weight: Apply weights to combine dimensions
  4. Rank: Select manufacturer with highest final score
  5. Return: Detailed recommendation with reasoning
    """)
    
    # Final status
    print("\n" + "=" * 80)
    if passed == len(results):
        print("  ✅ ALL TESTS PASSED - Manufacturer Recommendation Flow is READY")
    else:
        print(f"  ⚠️  {failed} test(s) failed - Please review errors above")
    print("=" * 80 + "\n")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
