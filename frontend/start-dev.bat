@echo off
echo Starting Frontend Development Server...
echo.

REM Kill any existing processes on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Killing process %%a on port 5173...
    taskkill /f /pid %%a >nul 2>&1
)

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

REM Start the development server
echo Starting Vite dev server...
npm run dev

pause
