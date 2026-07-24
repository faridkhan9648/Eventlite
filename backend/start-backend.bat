@echo off
echo Starting Backend Development Server...
echo.

REM Kill any existing processes on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing process %%a on port 5000...
    taskkill /f /pid %%a >nul 2>&1
)

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul 2>&1
    echo Please edit .env file with your MongoDB connection string and JWT secrets
    echo.
)

REM Start the development server
echo Starting backend server with tsx...
npm run dev

pause
