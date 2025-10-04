# Budget Manager - Development Start Script with Port Cleanup

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Budget Manager - Development Server  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add Node.js to PATH
$env:PATH = "C:\Program Files\nodejs;$env:PATH"

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Kill any processes using ports 5173, 5174
Write-Host "Cleaning up ports..." -ForegroundColor Yellow
$portsToKill = @(5173, 5174)
foreach ($port in $portsToKill) {
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($processes) {
            foreach ($pid in $processes) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  Killed process $pid on port $port" -ForegroundColor Gray
            }
        }
    } catch {
        # Port not in use, ignore
    }
}

Write-Host "✅ Ports cleaned" -ForegroundColor Green
Write-Host ""

# Start the dev server
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "  - Vite will run on http://localhost:5173 (or 5174 if 5173 is busy)" -ForegroundColor Gray
Write-Host "  - Electron window will open automatically" -ForegroundColor Gray
Write-Host "  - Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
