@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo       SMART QUEUE MANAGEMENT SYSTEM
echo ==========================================

if not exist "backend\node_modules" (
  echo Installing backend dependencies...
  pushd backend
  call npm install
  if errorlevel 1 (
    echo Backend dependency installation failed.
    popd
    pause
    exit /b 1
  )
  popd
)

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd frontend
  call npm install
  if errorlevel 1 (
    echo Frontend dependency installation failed.
    popd
    pause
    exit /b 1
  )
  popd
)

echo Starting backend...
start "SmartQueue Backend" cmd /k "cd /d ""%~dp0backend"" && npm start"

timeout /t 2 /nobreak >nul

echo Starting frontend...
start "SmartQueue Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Frontend: http://localhost:5173
echo Backend health: http://localhost:5000/api/health
echo.
echo Keep both terminal windows open while using the application.
pause
