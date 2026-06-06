@echo off
title ISO CRM — Startup
color 0A

echo.
echo  ============================================
echo   QCC ISO CRM — Starting All Services
echo  ============================================
echo.

:: Start Backend
echo  [1/2] Starting Backend Server (port 5000)...
start "ISO CRM Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
echo  [2/2] Starting Frontend (port 3000)...
start "ISO CRM Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo  ============================================
echo   Both servers are starting...
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Login Credentials:
echo   admin@crm.com    / admin123  (OTP login)
echo   client@crm.com   / client123
echo   auditor@crm.com  / auditor123
echo   reviewer@crm.com / reviewer123
echo   sales@crm.com    / sales123
echo  ============================================
echo.
pause
