# Quick Start - Verify Spring Boot <-> FastAPI Integration

## 3-Minute Quick Test

### Terminal 1: Start FastAPI Server

```bash
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000
```

**Wait for:**
```
Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### Terminal 2: Run Diagnostic

```bash
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex\python"
python diagnose_connection.py
```

**Expected output:**
```
[SUCCESS] FastAPI server is RUNNING at http://127.0.0.1:8000
[SUCCESS] Response Status: 200
[SUCCESS] All tests passed! Communication is working.
```

### Terminal 3: Start Spring Boot

```bash
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex\Spring_Boot"
mvn spring-boot:run
```

### Terminal 4: Make Request

```bash
# Test roster generation endpoint
curl -X POST http://localhost:8080/demo/roster/generate?date=2025-02-13 \
  -H "Content-Type: application/json"

# If using Windows PowerShell
curl.exe -X POST "http://localhost:8080/demo/roster/generate?date=2025-02-13" `
  -H "Content-Type: application/json"
```

---

## What to Look For

### ✅ Success Signs

**In FastAPI Terminal (Terminal 1):**
```
INFO:     127.0.0.1:xxxxx - "POST /api/assign-staff HTTP/1.1" 200 OK
[ASSIGN-STAFF] Request received for date: 2025-02-13
[ASSIGN-STAFF] Number of shifts: X
[ASSIGN-STAFF] Number of staff: Y
```

**In Spring Boot Logs (Terminal 3):**
```
========== CALLING ML SERVICE (FASTAPI) ==========
Endpoint: POST http://localhost:8000/api/assign-staff
Shifts: X
Staff: Y
Date: 2025-02-13
========== ML SERVICE RESPONSE ==========
Assignments: N
Coverage: X%
```

**In Diagnostic Output (Terminal 2):**
```
[SUCCESS] Response Status: 200
```

### ❌ Failure Signs

**FastAPI not running:**
```
[ERROR] Cannot connect to http://127.0.0.1:8000
[ERROR] Make sure FastAPI server is running
```

**Timeout from Spring Boot:**
```
java.util.concurrent.TimeoutException: Did not observe any item or terminal signal within 30s
```

**422 Validation Error:**
```
422 Unprocessable Entity
```

---

## Minimal Test Case

If you want to manually test without the whole application:

### Test 1: Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Test 2: Simple Roster Request
```bash
curl -X POST http://127.0.0.1:8000/api/assign-staff \
  -H "Content-Type: application/json" \
  -d "{"date": "2025-02-13", "shifts": [], "staff": []}"
```

### Test 3: Sourcing Recommendation
```bash
curl -X POST http://127.0.0.1:8000/api/sourcing/recommend \
  -H "Content-Type: application/json" \
  -d '{"context": {"purchaseOrderId": 1, "preferredPaymentMode": "CREDIT", "confidence": 0.9, "createdAt": "2025-02-13"}, "items": [], "manufacturers": []}'
```

---

## Troubleshooting Quick Fixes

### "Connection refused"
→ Start FastAPI: `python -m uvicorn python.main:app --host 127.0.0.1 --port 8000`

### "Read timed out"
→ Check FastAPI logs for errors; might be hanging on AI call

### "422 Validation Error"
→ Check data structure matches expected format

### "500 Internal Server Error"
→ Check GENAI_API_KEY environment variable is set

---

## Environment Setup

### Ensure GENAI_API_KEY is Set

**Windows Command Prompt:**
```cmd
set GENAI_API_KEY=your-key-here
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000
```

**Windows PowerShell:**
```powershell
$env:GENAI_API_KEY = "your-key-here"
python -m uvincorn python.main:app --host 127.0.0.1 --port 8000
```

**Windows (Permanent):**
```
Set environment variable GENAI_API_KEY in System Properties
```

---

## Next Steps After Verification

1. ✅ Verify FastAPI is running and can receive requests
2. ✅ Verify Spring Boot logs show request being sent
3. ✅ Verify FastAPI logs show request being received
4. ✅ Verify response is returned to Spring Boot
5. ✅ Check database to see if assignments were saved

---

## More Detailed Help

See `INTEGRATION_TROUBLESHOOTING.md` for comprehensive troubleshooting guide.
