#!/bin/bash

echo "======================================"
echo "   AI Studio Pro - Starting..."
echo "======================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please download and install Node.js from https://nodejs.org"
    echo
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo
    echo "WARNING: OPENAI_API_KEY environment variable not set"
    echo "AI features will not work without a valid API key"
    echo
    echo "To set your API key:"
    echo "  export OPENAI_API_KEY=your-api-key-here"
    echo
    echo "Or create a .env file with: OPENAI_API_KEY=your-api-key-here"
    echo
fi

echo "Starting AI Studio Pro..."
echo "Open your browser to: http://localhost:5000"
echo "Press Ctrl+C to stop"
echo

npm start