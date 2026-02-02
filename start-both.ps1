# Start Both Backend and Frontend
Write-Host "🚀 Starting YAARYATRA Services..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in background
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\mobile-app'; npm start"

Write-Host ""
Write-Host "✅ Both services starting in separate windows!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: Expo dev server will open" -ForegroundColor Cyan
