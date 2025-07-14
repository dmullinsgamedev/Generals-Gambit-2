@echo off
echo Starting General's Gambit Local Server...
echo.
echo This will start a simple web server on port 8000
echo Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try different Python commands
echo Trying to start Python server...
python -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :success

echo Python 'python' not found, trying 'python3'...
python3 -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :success

echo Python 'python3' not found, trying 'py'...
py -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :success

echo Python 'py' not found, trying specific Python path...
"%LOCALAPPDATA%\Programs\Python\Python313\python.exe" -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :success

echo Python not found, trying Node.js...
npx http-server -p 8000 2>nul
if %errorlevel% equ 0 goto :success

echo Neither Python nor Node.js found.
echo.
echo Please install one of the following:
echo 1. Python: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
echo Or use the local version: index-local.html
pause
exit /b 1

:success
echo Server started successfully!
echo Open your browser and go to: http://localhost:8000 