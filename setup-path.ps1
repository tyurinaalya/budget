# Add Node.js to PATH for this session
$env:PATH = "C:\Program Files\nodejs;$env:PATH"

Write-Host "✅ Node.js has been added to PATH" -ForegroundColor Green
Write-Host ""
Write-Host "Node version: " -NoNewline
node --version
Write-Host "npm version: " -NoNewline
npm --version
Write-Host ""
Write-Host "You can now run npm commands!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  npm run dev          - Start development mode"
Write-Host "  npm run build        - Build for production"
Write-Host "  npm run package:win  - Create Windows installer"
Write-Host ""
