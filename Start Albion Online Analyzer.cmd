@echo off
setlocal

cd /d "%~dp0"

title Albion Online Analyzer Launcher

echo Starting Albion Online Analyzer...
echo.

if not exist "node_modules" (
  echo Installing dependencies first...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Launching development server on http://localhost:3000
echo Keep this window open while using the app.
echo.

start "" http://localhost:3000
call npm.cmd run dev

echo.
echo Albion Online Analyzer has stopped.
pause
