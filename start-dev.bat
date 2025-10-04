@echo off
echo.
echo ========================================
echo   Budget Manager - Development Server
echo ========================================
echo.
echo Starting the application...
echo.

REM Add Node.js to PATH
set PATH=C:\Program Files\nodejs;%PATH%

REM Verify Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js: OK
echo npm: OK
echo.

REM Start the development server
npm run dev

pause
