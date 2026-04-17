@echo off
setlocal
cd /d "%~dp0"
set PYTHONUTF8=1

if exist ".venv\Scripts\python.exe" (
    set "GRAPHIFY_PYTHON=.venv\Scripts\python.exe"
) else (
    set "GRAPHIFY_PYTHON=python"
)

echo Running graphify refresh helper from %CD%
"%GRAPHIFY_PYTHON%" scripts\run_graphify_refresh.py
set EXIT_CODE=%ERRORLEVEL%

if not "%EXIT_CODE%"=="0" (
    echo.
    echo Graphify refresh exited with code %EXIT_CODE%.
)

pause
exit /b %EXIT_CODE%
