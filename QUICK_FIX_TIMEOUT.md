# ⚡ Quick Fix for Timeout Issue

## Problem
Frontend requests are timing out after 30 seconds, even though backend appears to be running.

## Root Cause
The backend might be:
1. Not actually listening on port 3000
2. Hanging during request processing
3. Crashed but process still running
4. Blocked by firewall

## Solution Applied

### 1. Fixed Code Error ✅
- Fixed `url is not defined` error in error handler
- Moved URL and method variables outside try block

### 2. Restarted Backend ✅
- Stopped any hanging processes
- Started fresh backend instance

## Next Steps

1. **Wait 10-15 seconds** for backend to fully start
2. **Check backend window** - you should see:
   ```
   ✅ Server listening on http://0.0.0.0:3000
   ```
3. **Test backend directly** in browser:
   - Open: `http://localhost:3000/health`
   - Should return JSON with status
4. **Try sign in again** in frontend

## If Still Timing Out

### Check Backend Logs
Look in the backend PowerShell window for:
- Error messages
- Database connection issues
- JWT secret errors

### Manual Test
```powershell
# Test backend health
Invoke-WebRequest -Uri "http://localhost:3000/health"

# Test signin endpoint (will fail auth but should respond)
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signin" -Method POST -Body '{"username":"test","password":"test"}' -ContentType "application/json"
```

### Common Issues
- **JWT secrets not set** - Backend will start but requests may hang
- **Database connection** - Check MongoDB URI in .env
- **Port conflict** - Another app using port 3000

## Debug Commands

```powershell
# Check if backend is listening
Get-NetTCPConnection -LocalPort 3000

# Check backend process
Get-Process -Name node | Where-Object { $_.Path -like "*backend*" }

# Test connection
Test-NetConnection -ComputerName localhost -Port 3000
```
