@echo off
REM Start script for Windows development mode

echo 🚀 Starting Multi-Agent Business Website Generator
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  Warning: .env file not found. Please create one from .env.example
    echo.
)

REM Start backend
echo 📦 Starting backend API...
start "Backend API" cmd /k "python -m uvicorn api.main:app --reload --port 8000"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Check if frontend dependencies are installed
echo 🎨 Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies (this may take a minute)...
    cd frontend
    call npm install
    cd ..
    echo ✅ Frontend dependencies installed!
    echo.
)

REM Start frontend
echo 🎨 Starting frontend...
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Services started!
echo    Backend API: http://localhost:8000
echo    Frontend UI: http://localhost:5173
echo    API Docs: http://localhost:8000/docs
echo.
echo Close the windows to stop the services
pause
