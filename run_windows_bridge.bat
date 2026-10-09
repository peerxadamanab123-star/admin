@echo off
title MAX / Myraa - Windows Desktop Bridge
color 0B
echo =========================================================
echo    MAX / Myraa Personal AI Assistant - Windows PC Bridge
echo    Created by Syed Manan
echo =========================================================
echo.
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not found in PATH!
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b
)

echo Starting MAX Desktop Companion on port 5005...
echo Once running, keep this window open while using MAX voice assistant.
echo.
python max_windows_bridge.py
pause
