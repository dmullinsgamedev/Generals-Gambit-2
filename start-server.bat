@echo off
echo Starting General's Gambit Local Server...
echo.
echo This will start a simple web server on port 8000
echo Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try Python first
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    echo Python not found, trying Node.js...
    npx http-server -p 8000 2>nul
    if %errorlevel% neq 0 (
        echo Neither Python nor Node.js found.
        echo.
        echo Please install one of the following:
        echo 1. Python: https://www.python.org/downloads/
        echo 2. Node.js: https://nodejs.org/
        echo.
        echo Or use the local version: index-local.html
        pause
    )
) 