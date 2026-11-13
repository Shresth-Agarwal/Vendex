# Commands to Run with venv

## PowerShell Commands for Windows

### 1. Navigate to Project
```powershell
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"
```

### 2. Activate venv
```powershell
& ".\python\venv\Scripts\Activate.ps1"
```

After this, your prompt should show `(venv)` at the beginning.

### 3. Install Dependencies (if needed)
```powershell
python -m pip install -r python/requirements.txt
```

### 4. Start FastAPI Server
```powershell
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000 --reload
```

Wait for message:
```
Uvicorn running on http://127.0.0.1:8000
```

### 5. In Another PowerShell Terminal - Verify Integration

```powershell
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"
python python/verify_integration.py
```

Expected output:
```
✓ FastAPI server is running
✓ Health endpoint working: healthy
✓ Roster endpoint working - 1 assignment(s) generated
✓ Sourcing endpoint working - Recommended manufacturer ID: 201
```

### 6. Run Full Diagnostics
```powershell
python python/diagnose_connection.py
```

---

## CMD Commands for Windows (if PowerShell has issues)

### 1. Navigate to Project
```cmd
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"
```

### 2. Activate venv
```cmd
python\venv\Scripts\activate.bat
```

### 3. Install Dependencies
```cmd
python -m pip install -r python\requirements.txt
```

### 4. Start FastAPI
```cmd
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000 --reload
```

### 5. Verify Integration (in another CMD window)
```cmd
python python\verify_integration.py
```

---

## What Each Command Does

| Command | Purpose |
|---------|---------|
| `Activate.ps1` | Activates the virtual environment (PowerShell) |
| `activate.bat` | Activates the virtual environment (CMD) |
| `pip install -r requirements.txt` | Installs all dependencies listed in requirements.txt |
| `python -m uvicorn ...` | Starts the FastAPI server |
| `verify_integration.py` | Tests if FastAPI is working and can communicate |
| `diagnose_connection.py` | Comprehensive diagnostic test |

---

## Troubleshooting Commands

### Check if venv is activated
```powershell
# Should show path to venv
Write-Host $env:VIRTUAL_ENV
```

### Check if port 8000 is in use
```powershell
netstat -ano | findstr :8000
```

### Kill process using port 8000
```powershell
# Find PID from above, then:
taskkill /PID <PID> /F
```

### Check Python version
```powershell
python --version
```

### List installed packages in venv
```powershell
pip list
```

### Update pip
```powershell
python -m pip install --upgrade pip
```

---

## Environment Variables

### Check if GENAI_API_KEY is set
```powershell
echo $env:GENAI_API_KEY
```

### Set GENAI_API_KEY (temporary, only for this session)
```powershell
$env:GENAI_API_KEY = "your-api-key-here"
```

### Verify it's set
```powershell
echo $env:GENAI_API_KEY
```

---

## Full Workflow Example

```powershell
# Step 1: Go to project
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"

# Step 2: Activate venv
& ".\python\venv\Scripts\Activate.ps1"

# Step 3: Install dependencies (only need to do once)
python -m pip install -r python/requirements.txt

# Step 4: Set API key (if not already set globally)
$env:GENAI_API_KEY = "your-key-here"

# Step 5: Start FastAPI
python -m uvicorn python.main:app --host 127.0.0.1 --port 8000

# Step 6: Open another PowerShell terminal and verify
cd "C:\Users\Rishi\Desktop\Program related\Projects\Vendex"
python python/verify_integration.py

# You should see all checks passing!
```

---

## Key Points

1. **Always activate venv before running commands:**
   - Commands must be run from within the venv
   - Other Python installations won't have the required packages

2. **FastAPI must be running for tests to pass:**
   - Keep terminal with FastAPI open and running
   - Open a new terminal for other commands

3. **Port 8000 must be free:**
   - If you get "Address already in use" error, something else is using it
   - Use `netstat` command above to find and kill the process

4. **API Key must be set:**
   - If you see "GENAI_API_KEY is not set" error, set it with the command above

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No module named 'google'" | Run `pip install google-generativeai` in venv |
| "Address already in use" | Kill process using `taskkill /PID <PID> /F` |
| "(venv) not showing in prompt" | Manually run Activate.ps1 script |
| "Connection refused" | Make sure FastAPI is running on port 8000 |
| API errors in FastAPI | Check that GENAI_API_KEY environment variable is set |

---

## Files Reference

- **venv location:** `C:\Users\Rishi\Desktop\Program related\Projects\Vendex\python\venv`
- **Requirements file:** `C:\Users\Rishi\Desktop\Program related\Projects\Vendex\python\requirements.txt`
- **FastAPI app:** `C:\Users\Rishi\Desktop\Program related\Projects\Vendex\python\main.py`
- **Verification script:** `C:\Users\Rishi\Desktop\Program related\Projects\Vendex\python\verify_integration.py`

---

**You're all set! Start using these commands to verify your Spring Boot ↔ FastAPI integration!**
