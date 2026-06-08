@echo off
echo ========================================
echo    MongoDB Local Setup for Team Tracker
echo ========================================
echo.

echo 🔍 Checking if MongoDB is already installed...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is already installed!
    goto :start_mongodb
) else (
    echo ❌ MongoDB not found. Please install it first.
    echo.
    goto :install_instructions
)

:install_instructions
echo 📥 MongoDB Installation Instructions:
echo.
echo Option 1: Download and Install Manually
echo 1. Go to: https://www.mongodb.com/try/download/community
echo 2. Download MongoDB Community Server for Windows
echo 3. Run the installer and follow the setup wizard
echo 4. Choose "Complete" installation
echo 5. Install MongoDB as a Service (recommended)
echo.
echo Option 2: Install using Chocolatey (if you have it)
echo 1. Open PowerShell as Administrator
echo 2. Run: choco install mongodb
echo.
echo Option 3: Install using winget
echo 1. Open PowerShell as Administrator  
echo 2. Run: winget install MongoDB.Server
echo.
echo After installation, run this script again.
echo.
pause
goto :end

:start_mongodb
echo 🚀 Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB service started successfully!
) else (
    echo ⚠️ MongoDB service might already be running or needs manual start
    echo Trying alternative start method...
    sc start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MongoDB service started!
    ) else (
        echo ❌ Could not start MongoDB service automatically
        echo Please start it manually from Services or MongoDB Compass
    )
)

echo.
echo 🧪 Testing MongoDB connection...
cd /d "%~dp0backend"
node test-database.js

echo.
echo ========================================
echo    MongoDB Setup Complete!
echo ========================================
echo.
echo 📋 Next Steps:
echo 1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
echo 2. Connect to: mongodb://localhost:27017
echo 3. Create database: productivity_tracker
echo 4. Run the application: start-all.bat
echo.
echo 🌐 MongoDB Compass Connection String:
echo mongodb://localhost:27017
echo.
pause

:end
