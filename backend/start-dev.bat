@echo off
echo Starting Devialet Development Environment...
echo.

REM Start Laravel Backend in new window
start "Laravel API (Port 8000)" cmd /k "php artisan serve"

REM Wait 2 seconds for backend to start
timeout /t 2 /nobreak > nul

REM Start React Frontend in new window
start "React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Development servers starting...
echo ========================================
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo ========================================
