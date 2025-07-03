@echo off
echo ========================================
echo    Team Tracker - Start All Services
echo ========================================
echo.

echo 🚀 Starting all Team Tracker services...
echo.

echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Application...
start "Frontend App" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul



echo.
echo ========================================
echo    🎉 All Services Started!
echo ========================================
echo.
echo 📋 Services Running:
echo    ✅ Backend Server  - http://localhost:5001
echo    ✅ Frontend App    - http://localhost:3000
echo.
echo 🔑 Manager Login:
echo    Email: dhchaudhary973@gmail.com
echo    Password: dhp@973
echo.
echo 📚 Documentation: ./docs/README.md
echo.
echo Press any key to open the web application...
pause > nul

start http://localhost:3000

echo.
echo 💡 Tip: Keep this window open to monitor the services.
echo To stop all services, close their respective terminal windows.
echo.
pause
