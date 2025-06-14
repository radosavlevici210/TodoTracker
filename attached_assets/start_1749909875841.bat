@echo off
echo ======================================
echo    AI Studio Pro - Starting...
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check for OpenAI API key
if "%OPENAI_API_KEY%"=="" (
    echo.
    echo WARNING: OPENAI_API_KEY environment variable not set
    echo AI features will not work without a valid API key
    echo.
    echo To set your API key:
    echo   set OPENAI_API_KEY=your-api-key-here
    echo.
    echo Or create a .env file with: OPENAI_API_KEY=your-api-key-here
    echo.
)

echo Starting AI Studio Pro...
echo Open your browser to: http://localhost:5000
echo Press Ctrl+C to stop
echo.

npm start