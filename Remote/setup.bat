@echo off
echo ========================================
echo    Team Tracker - Quick Setup Script
echo ========================================
echo.

echo 🚀 Starting Team Tracker setup...
echo.

echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!
echo.

echo 👤 Creating Manager Account...
call node scripts/create-manager.js
if %errorlevel% neq 0 (
    echo ❌ Manager account creation failed!
    pause
    exit /b 1
)
echo ✅ Manager account created successfully!
echo.

echo 📦 Installing Frontend Dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully!
echo.



cd ..

echo ========================================
echo    🎉 Setup Complete!
echo ========================================
echo.
echo 📋 Next Steps:
echo.
echo 1. Start Backend Server:
echo    cd backend
echo    npm run dev
echo.
echo 2. Start Frontend (in new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 
echo 🔑 Manager Login Credentials:
echo    Email: dhchaudhary973@gmail.com
echo    Password: dhp@973
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5001
echo.
echo 📚 Documentation: ./docs/README.md
echo.
pause
