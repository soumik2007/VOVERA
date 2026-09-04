@echo off
title VOVERA Startup Launcher
echo ===================================================
echo      VOVERA Edge AI Development Environment
echo ===================================================
echo.
echo Starting the AI Backend and React Frontend...
echo.

:: Start the Python Backend in a new window
echo [1/2] Launching Python FastAPI Backend...
start "Vovera Backend - PyTorch Engine" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload"

:: Start the React Frontend in a new window
echo [2/2] Launching React Web Frontend...
start "Vovera Frontend - React UI" cmd /k "cd web-frontend && npm run dev"

echo.
echo ===================================================
echo SUCCESS! Two new terminal windows have opened.
echo.
echo IMPORTANT: 
echo Wait for the Backend window to say "VoveraShield Ready!"
echo (This takes ~30 seconds to load the heavy AI models).
echo.
echo Then, open http://localhost:5173 in your browser.
echo ===================================================
echo.
pause
