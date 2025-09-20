@echo off
echo Starting Ambulance Tracking System...
echo.

echo Starting Backend (FastAPI)...
start cmd /k "cd backend && python main.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend (React)...
start cmd /k "cd frontend/ambulance-tracker && npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
