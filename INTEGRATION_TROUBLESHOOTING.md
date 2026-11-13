# Spring Boot <-> FastAPI Integration Troubleshooting Guide

## The Problem

When Spring Boot calls the FastAPI endpoints for manufacturer recommendation and roster generation:
1. ✅ Data is fetched from the database in Spring Boot
2. ❌ The request never reaches the FastAPI server
3. ❌ FastAPI endpoint never gets called

## Root Causes & Solutions

### 1. FastAPI Server Not Running

**Symptom:** Connection refused / timeout errors in Spring Boot logs

**Solution:**

```bash
# Terminal 1: Navigate to project root
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"

# Start the FastAPI server
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000
```

**Verification:**
```bash
# Terminal 2: Run diagnostic
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex\python"
python diagnose_connection.py
```

### 2. WebClient Not Configured Correctly

**Symptom:** Spring Boot logs show no request being made

**What we fixed:**
- ✅ Added logging interceptors to WebClient
- ✅ Added detailed error handling for timeouts
- ✅ Added request/response logging filters

**Check Spring Boot logs for:**
```
================== OUTGOING REQUEST ==================
Method: POST http://localhost:8000/api/assign-staff
================== END REQUEST ==================
```

If you don't see these lines, the WebClient isn't sending the request.

### 3. Data Serialization Mismatch

**Symptom:** Server returns 422 Unprocessable Entity

**What's happening:**
```
Spring Boot sends: RosterInputDto (Java object)
    ↓ 
    JSON serialization:
    {
      "date": "2025-02-13",
      "shifts": [...],
      "staff": [...]
    }
    ↓
FastAPI receives: StaffAvailability (Pydantic model)
```

**Verification:**
- Check FastAPI logs with: `python diagnose_connection.py`
- Should see `[ASSIGN-STAFF] Request received for date: 2025-02-13`

### 4. Network/Firewall Issue

**Symptom:** Cannot connect to localhost:8000

**Solutions:**

```bash
# Test connectivity from command line
curl -X GET http://127.0.0.1:8000/
# Should return: {"message": "Welcome to Vendex", "status": "running"}

# Test with POST (roster endpoint)
curl -X POST http://127.0.0.1:8000/api/assign-staff ^
  -H "Content-Type: application/json" ^
  -d "{\"date\": \"2025-02-13\", \"shifts\": [], \"staff\": []}"
```

---

## Step-by-Step Diagnostic Process

### Step 1: Verify FastAPI Server is Running

```bash
# Run Python diagnostic
python diagnose_connection.py
```

**Expected Output:**
```
[SUCCESS] FastAPI server is RUNNING at http://127.0.0.1:8000
[INFO] Response: {'message': 'Welcome to Vendex', 'status': 'running'}
```

**If it fails:**
- Start the server (see Step 1 above)
- Wait for "Uvicorn running on..." message

### Step 2: Check FastAPI Logs

When Spring Boot makes a request, you should see in the FastAPI terminal:

```
INFO:     127.0.0.1:xxxxx - "POST /api/assign-staff HTTP/1.1" 200 OK
[ASSIGN-STAFF] Request received for date: 2025-02-13
[ASSIGN-STAFF] Number of shifts: 10
[ASSIGN-STAFF] Number of staff: 25
```

**If you don't see these logs:**
- The request isn't reaching FastAPI
- Check Spring Boot logs (below)

### Step 3: Check Spring Boot Logs

Enable JDBC/WebClient logging in `application.properties`:

```properties
logging.level.org.springframework.web.reactive.function.client.ExchangeFilterFunction=DEBUG
logging.level.projects.vendex.providers.MlRosterDecisionProvider=DEBUG
```

**Look for:**
```
========== CALLING ML SERVICE (FASTAPI) ==========
Endpoint: POST http://localhost:8000/api/assign-staff
Shifts: 10
Staff: 25
Date: 2025-02-13
Sending request to FastAPI...
```

**If you don't see this:**
- The RosterService isn't calling the MlRosterDecisionProvider
- Check if MlRosterDecisionProvider is being injected properly
- Verify @Primary annotation is on MlRosterDecisionProvider

### Step 4: Test with Curl

```bash
# Simple test
curl -X POST http://127.0.0.1:8000/api/assign-staff ^
  -H "Content-Type: application/json" ^
  -d "{\"date\": \"2025-02-13\", \"shifts\": [{\"shiftId\": 1, \"startTime\": \"09:00\", \"endTime\": \"13:00\", \"requiredSkill\": \"BILLING\"}], \"staff\": [{\"staffId\": 101, \"skills\": [\"BILLING\"], \"hourlyRate\": 15.0, \"hoursWorkedThisWeek\": 20, \"availability\": [{\"day\": \"THURSDAY\", \"startTime\": \"08:00\", \"endTime\": \"17:00\"}]}]}"
```

**Expected Response:**
```json
{
  "assignments": [
    {
      "shiftId": 1,
      "staffId": 101,
      "confidence": 0.95
    }
  ],
  "coveragePercentage": 100.0,
  "overtimeRisk": false
}
```

---

## Data Flow - Step by Step

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT TRIGGERS ROSTER GENERATION                            │
│    /demo/roster/generate?date=2025-02-13                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SPRING BOOT → ROSTER CONTROLLER → ROSTER SERVICE            │
│    - Fetch open shifts from DB                                  │
│    - Fetch active staff from DB                                 │
│    - Build RosterInputDto                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. SPRING BOOT → ML ROSTER DECISION PROVIDER                    │
│    - Call mlWebClient.post()                                    │
│    - Send RosterInputDto as JSON                                │
│    - Wait for response (max 30 seconds)                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓ [HTTP POST: http://localhost:8000/api/assign-staff]
                     │
┌─────────────────────────────────────────────────────────────────┐
│ 4. FASTAPI ← RECEIVE REQUEST                                    │
│    - Deserialize JSON to StaffAvailability                      │
│    - Log request details                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. FASTAPI → ASSIGN STAFF                                       │
│    - Call assign_staff_to_shifts()                              │
│    - Generate assignments via AI                                │
│    - Return RosterDecisionDto                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓ [HTTP Response: 200 OK + JSON]
                     │
┌─────────────────────────────────────────────────────────────────┐
│ 6. SPRING BOOT ← RECEIVE RESPONSE                               │
│    - Deserialize to RosterDecisionDto                           │
│    - Apply assignments to DB                                    │
│    - Return RosterResponseDto to client                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Common Issues & Fixes

### Issue: "Connection refused"

```
java.net.ConnectException: Connection refused
```

**Fix:**
```bash
# Terminal 1: Ensure FastAPI is running
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Try again
# Make the roster generation request
```

### Issue: "Read timed out"

```
java.io.IOException: timeout
```

**Fix:**
- FastAPI server is not responding (might be hanging on AI call)
- Check if GENAI_API_KEY is set
- Check FastAPI logs for errors

### Issue: "422 Unprocessable Entity"

```
{"detail":[{"loc":["body"],"msg":"value is not a valid dictionary","type":"type_ error.dict"}]}
```

**Fix:**
- Data structure mismatch
- Check that JSON from Spring Boot matches StaffAvailability expected format
- Enable debug logging to see raw request

### Issue: "500 Internal Server Error"

```
{"detail": "Staffing Agent AI Error: ..."}
```

**Fix:**
- Check GENAI_API_KEY environment variable
- Check FastAPI logs for the specific error
- Review assign.py for JSON parsing issues

---

## Verification Checklist

Before claiming "data reaches FastAPI", verify:

- [ ] FastAPI server is running (check terminal for "Uvicorn running on 127.0.0.1:8000")
- [ ] Can ping health endpoint: `curl http://127.0.0.1:8000/`
- [ ] Can see request in FastAPI logs when making request from Spring Boot
- [ ] FastAPI processes the request (not just receives it)
- [ ] FastAPI returns proper response back to Spring Boot
- [ ] Spring Boot receives and deserializes response correctly

---

## Debug Endpoints

### Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Raw Request Debugging
```bash
curl -X POST http://127.0.0.1:8000/api/debug/raw-request \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## Improvements Made

### FastAPI Side:
- ✅ Added comprehensive logging
- ✅ Added health check endpoint
- ✅ Added debug endpoint for raw requests
- ✅ Added CORS middleware for Spring Boot requests
- ✅ Better error messages with full stack traces

### Spring Boot Side:
- ✅ Added WebClient logging filter
- ✅ Added detailed request/response logging
- ✅ Added timeout handling
- ✅ Improved error messages
- ✅ Added detailed debug logging in MlRosterDecisionProvider

---

## Next Steps

1. **Restart Spring Boot** with the new code
2. **Verify FastAPI is running** with: `python diagnose_connection.py`
3. **Make a roster generation request** from the application
4. **Check both logs** (Spring Boot and FastAPI) with the steps above
5. **Report the specific error** if it still doesn't work

---

## Support Information

If the issue persists, provide:

1. **Spring Boot logs** showing the MlRosterDecisionProvider calls
2. **FastAPI logs** from when the request was made
3. **curl test result** from Step 4 above
4. **Environment check**: Is GENAI_API_KEY set?
