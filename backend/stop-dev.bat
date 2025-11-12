@echo off
echo Stopping all development servers...

REM Kill PHP processes (Laravel)
taskkill /F /IM php.exe /T >nul 2>&1

REM Kill Node processes (Vite/React)
taskkill /F /IM node.exe /T >nul 2>&1

echo Development servers stopped.
pause
