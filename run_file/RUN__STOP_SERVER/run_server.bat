@echo off
title ETMS Starter

echo Starting XAMPP Apache and MySQL...
start "XAMPP" "C:\xampp\xampp_start.exe"

:: Wait for services
timeout /t 5 /nobreak >nul

echo Starting Laravel Backend...
cd /d C:\xampp\htdocs\ElectronicTreasurerManagementSystem\backend
start "Laravel Backend" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"

:: Wait a bit
timeout /t 3 /nobreak >nul

echo Starting React Frontend...
cd /d C:\xampp\htdocs\ElectronicTreasurerManagementSystem\frontend
start "React Frontend" cmd /k "set HOST=0.0.0.0 && set PORT=3000 && npm start"

echo.
echo Services started:
echo Backend:  http://192.168.101.20:8000
echo Frontend: http://192.168.101.20:3000
echo.
pause
